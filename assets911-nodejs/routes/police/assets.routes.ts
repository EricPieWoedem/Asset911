import express from 'express';
import { getAssetByUniqueNumber } from '../../controllers/police/assets.controller';

const policeAssetRouter = express.Router();

policeAssetRouter.get('/:uniqueNumber', getAssetByUniqueNumber);

export default policeAssetRouter;
