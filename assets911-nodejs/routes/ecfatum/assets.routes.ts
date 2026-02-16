import express from 'express';
import {
  getAllPublicAssets,
  getAssetsOfAllOnboardedInstittutions,
  getPublicAssetById,
} from '../../controllers/ecfatum/assets.controller';

const ecfatumAssetsRouter = express.Router();

ecfatumAssetsRouter.get('/public', getAllPublicAssets);
ecfatumAssetsRouter.get('/public/:id', getPublicAssetById);
ecfatumAssetsRouter.get('/institutions', getAssetsOfAllOnboardedInstittutions);

export default ecfatumAssetsRouter;
