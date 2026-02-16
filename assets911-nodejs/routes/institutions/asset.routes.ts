import express from 'express';
import {
  createAsset,
  editAsset,
  getAllInstitutionAssets,
  assignAsset,
  unAssignAsset,
  getAssetAssignmentHistory,
  getSingleAsset,
  getBrands,
  getSelectedAssetsAssignmentHistory,
  getStats,
} from '../../controllers/institutions/assets.controller';

const institutionAssetRouter = express.Router();

institutionAssetRouter.post('/', createAsset);
institutionAssetRouter.patch('/:id', editAsset);
institutionAssetRouter.get('/all', getAllInstitutionAssets);
institutionAssetRouter.post('/assign/:id', assignAsset);
institutionAssetRouter.patch('/unassign/:id', unAssignAsset);
institutionAssetRouter.get('/history', getAssetAssignmentHistory);
institutionAssetRouter.get('/view/:id', getSingleAsset);
institutionAssetRouter.get('/brands', getBrands);
institutionAssetRouter.get('/history/:id', getSelectedAssetsAssignmentHistory);
institutionAssetRouter.get('/stats', getStats);

export default institutionAssetRouter;
