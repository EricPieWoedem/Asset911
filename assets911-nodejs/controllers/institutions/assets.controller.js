const InstitutionAsset = require('../../models/institutions/asset.model');
const AssetAssignmentHistory = require('../../models/institutions/assetAssignment.model');
const mongoose = require('mongoose');

const createAsset = async (req, res) => {
  try {
    const existingAsset = await InstitutionAsset.findOne({
      uniqueNumber: req.body.uniqueNumber,
    });
    if (existingAsset) return res.status(400).json('Asset already exists');
    const asset = await InstitutionAsset.create({
      ...req.body,
      name: `${req.body.brand} ${req.body.model}`,
      owner: req.institutionId,
    });
    if (!asset) return res.status(400).json('Failed to create asset');
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getAllInstitutionAssets = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let search = req.query?.search || '';
  const institutionId = new mongoose.Types.ObjectId(req.institutionId);

  try {
    const countPipeline = [
      {
        $match: {
          owner: institutionId,
          $or: [
            { uniqueNumber: { $regex: new RegExp(search, 'i') } },
            { name: { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
      { $count: 'total' },
    ];

    const countResult = await InstitutionAsset.aggregate(countPipeline);

    if (!countResult[0]) {
      return res.status(404).json('No assets found');
    }

    const total = countResult[0].total;

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const retrievalPipeline = [
      {
        $match: {
          owner: institutionId,
          $or: [
            { uniqueNumber: { $regex: new RegExp(search, 'i') } },
            { name: { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];

    const results = await InstitutionAsset.aggregate(retrievalPipeline);

    if (!results) {
      return res.status(404).json('No assets found');
    }

    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      assets: results,
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
    const updatedAsset = await InstitutionAsset.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.institutionId,
      },
      { ...req.body },
      { new: true }
    );
    if (!updatedAsset) return res.status(400).json('Failed to update asset');
    res.status(201).json('Updated Asset Successfully');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const assignAsset = async (req, res) => {
  const { staffId, staffName } = req.body;
  try {
    const assetToAssign = await InstitutionAsset.findOne({
      _id: req.params.id,
      owner: req.institutionId,
    });
    if (!assetToAssign) return res.status(404).json('No asset found');

    const checkifAssetIsAlreadyAssigned = assetToAssign.assignedTo;

    if (Object.keys(checkifAssetIsAlreadyAssigned).length > 1)
      return res
        .status(400)
        .json(
          `Asset is already assigned to ${checkifAssetIsAlreadyAssigned.staff}`
        );

    const history = await AssetAssignmentHistory.create({
      assetId: assetToAssign._id,
      staffId,
      staffName,
      assginedOn: new Date().toISOString(),
      institutionId: req.institutionId,
    });

    assetToAssign.assignedTo = {
      staff: `${staffName} (${staffId})`,
      assignmentId: history.id,
    };
    const result = await assetToAssign.save();

    if (history && result) {
      res.status(200).json('Asset Assigned Successfully');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const unAssignAsset = async (req, res) => {
  try {
    const assetToMakeAvailable = await InstitutionAsset.findOne({
      _id: req.params.id,
      owner: req.institutionId,
    });

    if (!assetToMakeAvailable) return res.status(404).json('No asset found');
    const history = await AssetAssignmentHistory.findById(
      assetToMakeAvailable.assignedTo.assignmentId
    );

    if (!history) return res.status(404).json('No assignment history found');

    history.unAssignedOn = new Date().toISOString();
    assetToMakeAvailable.assignedTo = { staffName: '' };

    const historyResult = await history.save();
    const assetToMakeAvailableResult = await assetToMakeAvailable.save();

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
  const institutionId = new mongoose.Types.ObjectId(req.institutionId);

  try {
    const countPipeline = [
      {
        $match: {
          institutionId,
          $or: [
            { staffId: { $regex: new RegExp(search, 'i') } },
            { staffName: { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
      { $count: 'total' },
    ];

    const countResult = await AssetAssignmentHistory.aggregate(countPipeline);

    if (!countResult[0]) {
      return res.status(404).json('No history found');
    }

    const total = countResult[0].total;

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const retrievalPipeline = [
      {
        $match: {
          institutionId,
          $or: [
            { staffId: { $regex: new RegExp(search, 'i') } },
            { staffName: { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];
    const results = await AssetAssignmentHistory.aggregate(retrievalPipeline);

    if (!results) {
      return res.status(404).json('No history found');
    }

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
    const asset = await InstitutionAsset.findById(req.params.id);
    if (!asset) return res.status(404).json('No asset found');
    if (req.institutionId === asset.owner.toString()) {
      res.status(200).json(asset);
    } else {
      res.status(401).json('Unauthorized');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getBrands = async (req, res) => {
  const institutionId = new mongoose.Types.ObjectId(req.institutionId);
  try {
    const pipeline = [
      {
        $match: {
          owner: institutionId,
        },
      },
      {
        $group: {
          _id: '$brand',
          models: { $addToSet: '$model' },
        },
      },
      {
        $project: {
          _id: 0,
          brand: '$_id',
          models: 1,
        },
      },
      {
        $group: {
          _id: null,
          brandModelPairs: { $push: { k: '$brand', v: '$models' } },
        },
      },
      {
        $replaceRoot: { newRoot: { $arrayToObject: '$brandModelPairs' } },
      },
    ];

    const result = await InstitutionAsset.aggregate(pipeline);

    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getSelectedAssetsAssignmentHistory = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let search = req.query?.search || '';
  const institutionId = new mongoose.Types.ObjectId(req.institutionId);
  const assetId = new mongoose.Types.ObjectId(req.params.id);

  try {
    const countPipeline = [
      {
        $match: {
          institutionId,
          assetId,
          $or: [
            { staffId: { $regex: new RegExp(search, 'i') } },
            { staffName: { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
      { $count: 'total' },
    ];

    const countResult = await AssetAssignmentHistory.aggregate(countPipeline);

    if (!countResult[0]) {
      return res.status(404).json('No history found');
    }

    const total = countResult[0].total;

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const retrievalPipeline = [
      {
        $match: {
          institutionId,
          assetId,
          $or: [
            { staffId: { $regex: new RegExp(search, 'i') } },
            { staffName: { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];
    const results = await AssetAssignmentHistory.aggregate(retrievalPipeline);

    if (!results) {
      return res.status(404).json('No history found');
    }

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
  const institutionId = new mongoose.Types.ObjectId(req.institutionId);

  try {
    const totalAssetCountPipeline = [
      {
        $match: {
          owner: institutionId,
        },
      },
      { $count: 'total' },
    ];

    const totalAssetCountResult = await InstitutionAsset.aggregate(
      totalAssetCountPipeline
    );

    const totalAssetCount = totalAssetCountResult[0]?.total || 0;

    const totalUnassignedAssetCountPipeline = [
      {
        $match: {
          owner: institutionId,
          assignedTo: { staffName: '' },
        },
      },
      { $count: 'total' },
    ];

    const totalUnassignedAssetCountResult = await InstitutionAsset.aggregate(
      totalUnassignedAssetCountPipeline
    );

    const totalUnassignedAssetCount =
      totalUnassignedAssetCountResult[0]?.total || 0;

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
