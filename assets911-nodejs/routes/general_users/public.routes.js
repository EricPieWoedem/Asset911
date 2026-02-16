const express = require('express');
const {
  getAssetByUniqueNumber,
  getAssetsOnSale,
} = require('../../controllers/general_users/public.controller');

const publicRouter = express.Router();

publicRouter.get('/store/for-sale', getAssetsOnSale);
publicRouter.get('/:uniqueNumber', getAssetByUniqueNumber);

module.exports = publicRouter;
