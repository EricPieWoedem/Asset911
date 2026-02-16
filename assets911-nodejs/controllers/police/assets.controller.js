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

module.exports = { getAssetByUniqueNumber };
