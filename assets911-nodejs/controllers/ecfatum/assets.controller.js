//controllers to manage all assets on ecfatums platform

const Assets = require('../../models/general_users/asset.model');
const InstitutionAssets = require('../../models/institutions/asset.model');

//Public user assets management

const getAllPublicAssets = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let searchField = req.query?.searchField || 'uniqueNumber';
  let search = req.query?.search || '';
  try {
    const countPipeline = [
      { $match: { [searchField]: { $regex: new RegExp(search, 'i') } } },
      { $count: 'total' },
    ];

    const countResult = await Assets.aggregate(countPipeline);

    if (!countResult[0]) {
      return res.status(404).json('No assets found');
    }

    const total = countResult[0].total;
    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const retrievalPipeline = [
      { $match: { [searchField]: { $regex: new RegExp(search, 'i') } } },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];

    const results = await Assets.aggregate(retrievalPipeline);
    if (!results) {
      return res.status(404).json('No assets found');
    }

    res.status(200).json({
      assets: results,
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
    const asset = await Assets.findById(req.params.id).populate('owner').exec();
    if (!asset) return res.status(404).json('Asset not found');
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

//institution assets management

const getAssetsOfAllOnboardedInstittutions = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let uniqueNumberSearch = req.query?.uniqueNumberSearch || '';
  let institutionSearch = req.query?.institutionSearch || '';
  let brandSearch = req.query?.brandSearch || '';

  try {
    const countPipeline = [
      {
        $match: {
          $or: [
            { uniqueNumber: { $regex: new RegExp(uniqueNumberSearch, 'i') } },
            { institutionId: { $regex: new RegExp(institutionSearch, 'i') } },
            { brand: { $regex: new RegExp(brandSearch, 'i') } },
          ],
        },
      },
      { $count: 'total' },
    ];
    const countResult = await InstitutionAssets.aggregate(countPipeline);
    if (!countResult[0])
      return res.status(404).json('No assets found at count');
    const total = countResult[0].total;
    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const retrievalPipeline = [
      {
        $match: {
          $or: [
            { uniqueNumber: { $regex: new RegExp(uniqueNumberSearch, 'i') } },
            { institutionId: { $regex: new RegExp(institutionSearch, 'i') } },
            { brand: { $regex: new RegExp(brandSearch, 'i') } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];

    const results = await InstitutionAssets.aggregate(retrievalPipeline);
    if (!results) {
      return res.status(404).json('No assets found');
    }
    res.status(200).json({
      assets: results,
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
