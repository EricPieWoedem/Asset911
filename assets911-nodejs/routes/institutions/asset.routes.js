const {
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
} = require('../../controllers/institutions/assets.controller');

const institutionAssetRouter = require('express').Router();

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

module.exports = institutionAssetRouter;
