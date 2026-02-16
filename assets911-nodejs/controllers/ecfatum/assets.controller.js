const prisma = require('../../config/prisma');

const mapAssetForResponse = asset => ({
  ...asset,
  status: asset.status === 'for_sale' ? 'for sale' : asset.status,
  purchaseReciept: asset.purchaseReceipt,
});

const allowedPublicSearchFields = new Set([
  'uniqueNumber',
  'name',
  'brand',
  'model',
  'type',
  'status',
]);

const getAllPublicAssets = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let searchField = req.query?.searchField || 'uniqueNumber';
  let search = req.query?.search || '';
  try {
    const normalizedSearchField = allowedPublicSearchFields.has(searchField)
      ? searchField
      : 'uniqueNumber';
    const where = {
      [normalizedSearchField]: { contains: search, mode: 'insensitive' },
    };
    const total = await prisma.asset.count({ where });
    if (!total) return res.status(404).json('No assets found');
    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const results = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No assets found');

    res.status(200).json({
      assets: results.map(mapAssetForResponse),
      totalPages: Math.ceil(total / pageSize),
      total,
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getPublicAssetById = async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: { owner: true },
    });
    if (!asset) return res.status(404).json('Asset not found');
    res.status(200).json(mapAssetForResponse(asset));
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getAssetsOfAllOnboardedInstittutions = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let uniqueNumberSearch = req.query?.uniqueNumberSearch || '';
  let institutionSearch = req.query?.institutionSearch || '';
  let brandSearch = req.query?.brandSearch || '';

  try {
    const where = {
      OR: [
        { uniqueNumber: { contains: uniqueNumberSearch, mode: 'insensitive' } },
        { ownerId: { contains: institutionSearch, mode: 'insensitive' } },
        { brand: { contains: brandSearch, mode: 'insensitive' } },
      ],
    };
    const total = await prisma.institutionAsset.count({ where });
    if (!total) return res.status(404).json('No assets found at count');
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
    res.status(200).json({
      assets: results.map(mapAssetForResponse),
      totalPages: Math.ceil(total / pageSize),
      total,
      currentPage: pageNumber,
      pageSize,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

module.exports = {
  getAllPublicAssets,
  getPublicAssetById,
  getAssetsOfAllOnboardedInstittutions,
};
