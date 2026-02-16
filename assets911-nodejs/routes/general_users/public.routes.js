const express = require('express');
const {
  getAssetByUniqueNumber,
  getAssetsOnSale,
} = require('../../controllers/general_users/public.controller');

const publicRouter = express.Router();

publicRouter.get('/:uniqueNumber', getAssetByUniqueNumber);
publicRouter.get('/store/for-sale', getAssetsOnSale);

module.exports = publicRouter;
