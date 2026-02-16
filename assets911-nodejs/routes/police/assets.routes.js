const {
  getAssetByUniqueNumber,
} = require('../../controllers/police/assets.controller');

const policeAssetRouter = require('express').Router();

policeAssetRouter.get('/:uniqueNumber', getAssetByUniqueNumber);

module.exports = policeAssetRouter;
