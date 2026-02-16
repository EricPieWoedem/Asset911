const prisma = require('../../config/prisma');

const mapAssetForResponse = asset => ({
  ...asset,
  status: asset.status === 'for_sale' ? 'for sale' : asset.status,
  purchaseReciept: asset.purchaseReceipt,
});

const getAssetByUniqueNumber = async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: {
        uniqueNumber: req.params.uniqueNumber,
      },
      include: { owner: true },
    });
    if (!asset) return res.status(404).json('asset not found');
    res.status(200).json(mapAssetForResponse(asset));
  } catch (error) {
    res.status(500).json('internal server error');
  }
};

const getAssetsOnSale = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let search = req.query?.search || '';
  let category = req.query?.category || '';
  let maxPrice = req.query?.maxPrice ? Number(req.query.maxPrice) : null;
  let minPrice = req.query?.minPrice ? Number(req.query.minPrice) : null;

  try {
    const where = {
      status: 'for_sale',
      OR: [
        { type: { contains: category, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ],
      ...(maxPrice !== null || minPrice !== null
        ? {
            price: {
              ...(minPrice !== null ? { gte: minPrice } : {}),
              ...(maxPrice !== null ? { lte: maxPrice } : {}),
            },
          }
        : {}),
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
      include: { owner: true },
    });
    if (!results.length) return res.status(404).json('No assets found ');

    const totalPages = Math.ceil(total / pageSize);
    res.json({
      assets: results.map(mapAssetForResponse),
      totalPages,
      currentPage: pageNumber,
      count: total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

module.exports = { getAssetByUniqueNumber, getAssetsOnSale };
