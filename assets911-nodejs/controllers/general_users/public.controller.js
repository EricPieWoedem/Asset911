// These controllers are for the routes that do not require authentication
const Asset = require('../../models/general_users/asset.model');

const getAssetByUniqueNumber = async (req, res) => {
  try {
    const asset = await Asset.findOne({
      uniqueNumber: req.params.uniqueNumber,
    }).populate('owner');
    if (!asset) return res.status(404).json('asset not found');
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json('internal server error');
  }
};

const getAssetsOnSale = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let search = req.query?.search || '';
  let category = req.query?.category || '';
  let maxPrice = req.query?.price || '';
  let minPrice = req.query?.price || '';

  try {
    // Pipeline for counting total documents
    const countPipeline = [
      {
        $match: {
          status: 'for sale',
          $or: [
            { type: { $regex: new RegExp(category, 'i') } },
            { name: { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
      { $count: 'total' },
    ];

    const countResult = await Asset.aggregate(countPipeline);

    if (!countResult[0]) {
      return res.status(404).json('No assets found');
    }

    const total = countResult[0].total;

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }
    // Pipeline for retrieving paginated results
    const retrievalPipeline = [
      {
        $match: {
          status: 'for sale',
          $or: [
            { type: { $regex: new RegExp(category, 'i') } },
            { name: { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];

    const results = await Asset.aggregate(retrievalPipeline);

    if (!results[0]) {
      return res.status(404).json('No assets found ');
    }

    const totalPages = Math.ceil(total / pageSize);
    res.json({
      assets: results,
      totalPages,
      currentPage: pageNumber,
      count: total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

module.exports = { getAssetByUniqueNumber, getAssetsOnSale };
