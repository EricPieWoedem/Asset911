import express from 'express';
import {
  addAsset,
  changeAssetStatus,
  getAllAssets,
  getAllUserAssets,
  transferAsset,
  updateAsset,
  deleteAsset,
  getSingleAsset,
  getTransferredAssets,
  getRecievedAssets,
  confirmTransfer,
  getSingleTransferRecord,
  resendTransferConfirmationCode,
  generateDummyData,
  cancelAssetTransfer,
} from '../../controllers/general_users/assets.controllers';

const assetRouter = express.Router();

assetRouter.get('/', getAllAssets);
assetRouter.get('/user', getAllUserAssets);
assetRouter.get('/user-assets', getAllUserAssets);
assetRouter.get('/user/transferred', getTransferredAssets);
assetRouter.get('/user/recieved', getRecievedAssets);
assetRouter.get('/transfer-record/:id', getSingleTransferRecord);
assetRouter.get('/resend-confirmation-code/:id', resendTransferConfirmationCode);
assetRouter.post('/add', addAsset);
assetRouter.patch('/update/:id', updateAsset);
assetRouter.patch('/change-status/:id', changeAssetStatus);
assetRouter.post('/transfer-asset/:id', transferAsset);
assetRouter.patch('/confirm-transfer/:id', confirmTransfer);
assetRouter.delete('/delete/:id', deleteAsset);
assetRouter.post('/generateDummy', generateDummyData);
assetRouter.patch('/cancel-asset/:id', cancelAssetTransfer);
assetRouter.get('/:id', getSingleAsset);

export default assetRouter;
