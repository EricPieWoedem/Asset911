const prisma = require('../../config/prisma');

const toDbStatus = status => {
  if (status === 'for sale') return 'for_sale';
  return status;
};

const fromDbStatus = status => {
  if (status === 'for_sale') return 'for sale';
  return status;
};

const mapInstitutionAssetForResponse = asset => ({
  ...asset,
  status: fromDbStatus(asset.status),
  purchaseReciept: asset.purchaseReceipt,
});

const createAsset = async (req, res) => {
  try {
    const existingAsset = await prisma.institutionAsset.findFirst({
      where: { uniqueNumber: req.body.uniqueNumber },
    });
    if (existingAsset) return res.status(400).json('Asset already exists');
    const asset = await prisma.institutionAsset.create({
      data: {
        model: req.body.model || null,
        brand: req.body.brand || null,
        type: req.body.type,
        categoryType: req.body.categoryType || null,
        name: `${req.body.brand} ${req.body.model}`,
        uniqueNumber: req.body.uniqueNumber || null,
        dateOfPurchase: req.body.dateOfPurchase || null,
        price: Number(req.body.price),
        purchaseReceipt: req.body.purchaseReceipt || req.body.purchaseReciept || '',
        identificationDetails: req.body.identificationDetails,
        otherDetails: req.body.otherDetails || null,
        images: req.body.images || [],
        ownerId: req.institutionId,
        registrationAddress: req.body.registrationAddress,
        assetLocation: req.body.assetLocation,
        status: toDbStatus(req.body.status || 'okay'),
        properties: req.body.properties || undefined,
        additionalCategoryData: req.body.additionalCategoryData || undefined,
      },
    });
    if (!asset) return res.status(400).json('Failed to create asset');
    res.status(200).json(mapInstitutionAssetForResponse(asset));
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getAllInstitutionAssets = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let search = req.query?.search || '';

  try {
    const where = {
      ownerId: req.institutionId,
      OR: [
        { uniqueNumber: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ],
    };
    const total = await prisma.institutionAsset.count({ where });
    if (!total) return res.status(404).json('No assets found');

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const results = await prisma.institutionAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No assets found');

    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      assets: results.map(mapInstitutionAssetForResponse),
      totalPages,
      currentPage: pageNumber,
      total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const editAsset = async (req, res) => {
  try {
    const existing = await prisma.institutionAsset.findFirst({
      where: { id: req.params.id, ownerId: req.institutionId },
    });
    if (!existing) return res.status(400).json('Failed to update asset');
    const data = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(data, 'status')) {
      data.status = toDbStatus(data.status);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'purchaseReciept')) {
      data.purchaseReceipt = data.purchaseReciept;
      delete data.purchaseReciept;
    }
    await prisma.institutionAsset.update({
      where: { id: req.params.id },
      data,
    });
    res.status(201).json('Updated Asset Successfully');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const assignAsset = async (req, res) => {
  const { staffId, staffName } = req.body;
  try {
    const assetToAssign = await prisma.institutionAsset.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.institutionId,
      },
    });
    if (!assetToAssign) return res.status(404).json('No asset found');

    const checkifAssetIsAlreadyAssigned = assetToAssign.assignedTo || {};

    if (Object.keys(checkifAssetIsAlreadyAssigned).length > 1) {
      return res
        .status(400)
        .json(
          `Asset is already assigned to ${checkifAssetIsAlreadyAssigned.staff}`
        );
    }

    const history = await prisma.assetAssignmentHistory.create({
      data: {
        assetId: assetToAssign.id,
        staffId,
        staffName,
        assginedOn: new Date().toISOString(),
        institutionId: req.institutionId,
      },
    });

    await prisma.institutionAsset.update({
      where: { id: assetToAssign.id },
      data: {
        assignedTo: {
          staff: `${staffName} (${staffId})`,
          assignmentId: history.id,
        },
      },
    });

    if (history) {
      res.status(200).json('Asset Assigned Successfully');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const unAssignAsset = async (req, res) => {
  try {
    const assetToMakeAvailable = await prisma.institutionAsset.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.institutionId,
      },
    });

    if (!assetToMakeAvailable) return res.status(404).json('No asset found');
    const assignmentId = assetToMakeAvailable.assignedTo?.assignmentId;
    if (!assignmentId) return res.status(404).json('No assignment history found');
    const history = await prisma.assetAssignmentHistory.findUnique({
      where: { id: assignmentId },
    });

    if (!history) return res.status(404).json('No assignment history found');

    const historyResult = await prisma.assetAssignmentHistory.update({
      where: { id: history.id },
      data: { unAssignedOn: new Date().toISOString() },
    });
    const assetToMakeAvailableResult = await prisma.institutionAsset.update({
      where: { id: assetToMakeAvailable.id },
      data: { assignedTo: { staffName: '' } },
    });

    if (historyResult && assetToMakeAvailableResult) {
      res.status(200).json('Asset Unassigned Successfully');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getAssetAssignmentHistory = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let search = req.query?.search || '';

  try {
    const where = {
      institutionId: req.institutionId,
      OR: [
        { staffId: { contains: search, mode: 'insensitive' } },
        { staffName: { contains: search, mode: 'insensitive' } },
      ],
    };
    const total = await prisma.assetAssignmentHistory.count({ where });
    if (!total) return res.status(404).json('No history found');

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const results = await prisma.assetAssignmentHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No history found');

    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      results,
      totalPages,
      currentPage: pageNumber,
      total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getSingleAsset = async (req, res) => {
  try {
    const asset = await prisma.institutionAsset.findUnique({
      where: { id: req.params.id },
    });
    if (!asset) return res.status(404).json('No asset found');
    if (req.institutionId === asset.ownerId) {
      res.status(200).json(mapInstitutionAssetForResponse(asset));
    } else {
      res.status(401).json('Unauthorized');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getBrands = async (req, res) => {
  try {
    const assets = await prisma.institutionAsset.findMany({
      where: { ownerId: req.institutionId },
      select: { brand: true, model: true },
    });
    const grouped = {};
    assets.forEach(asset => {
      if (!asset.brand) return;
      if (!grouped[asset.brand]) grouped[asset.brand] = [];
      if (asset.model && !grouped[asset.brand].includes(asset.model)) {
        grouped[asset.brand].push(asset.model);
      }
    });
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getSelectedAssetsAssignmentHistory = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let search = req.query?.search || '';

  try {
    const where = {
      institutionId: req.institutionId,
      assetId: req.params.id,
      OR: [
        { staffId: { contains: search, mode: 'insensitive' } },
        { staffName: { contains: search, mode: 'insensitive' } },
      ],
    };
    const total = await prisma.assetAssignmentHistory.count({ where });
    if (!total) return res.status(404).json('No history found');

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const results = await prisma.assetAssignmentHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No history found');

    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      results,
      totalPages,
      currentPage: pageNumber,
      total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getStats = async (req, res) => {
  try {
    const totalAssetCount = await prisma.institutionAsset.count({
      where: { ownerId: req.institutionId },
    });
    const totalUnassignedAssetCount = await prisma.institutionAsset.count({
      where: {
        ownerId: req.institutionId,
        assignedTo: { path: ['staffName'], equals: '' },
      },
    });

    const totalAssigned = totalAssetCount - totalUnassignedAssetCount;

    res
      .status(200)
      .json({ totalAssetCount, totalUnassignedAssetCount, totalAssigned });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

module.exports = {
  createAsset,
  editAsset,
  getAllInstitutionAssets,
  assignAsset,
  unAssignAsset,
  getAssetAssignmentHistory,
  getSelectedAssetsAssignmentHistory,
  getSingleAsset,
  getBrands,
  getStats,
};
