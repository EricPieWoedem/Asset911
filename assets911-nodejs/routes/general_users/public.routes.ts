import express from 'express';
import {
  getAssetByUniqueNumber,
  getAssetsOnSale,
} from '../../controllers/general_users/public.controller';

const publicRouter = express.Router();

publicRouter.get('/store/for-sale', getAssetsOnSale);
publicRouter.get('/:uniqueNumber', getAssetByUniqueNumber);

export default publicRouter;
