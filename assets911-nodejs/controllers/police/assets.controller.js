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

module.exports = { getAssetByUniqueNumber };
