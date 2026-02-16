const {
  getAllPublicAssets,
  getAssetsOfAllOnboardedInstittutions,
  getPublicAssetById,
} = require('../../controllers/ecfatum/assets.controller');
const express = require('express');

const ecfatumAssetsRouter = express.Router();

// public
ecfatumAssetsRouter.get('/public', getAllPublicAssets);
ecfatumAssetsRouter.get('/public/:id', getPublicAssetById);

//institutions
ecfatumAssetsRouter.get('/institutions', getAssetsOfAllOnboardedInstittutions);

module.exports = ecfatumAssetsRouter;
