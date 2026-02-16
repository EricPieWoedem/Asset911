const insuranceRouter = require('express').Router();
const { getUsers } = require('../../controllers/general_users/user.controller');
const {
  getAssets,
} = require('../../controllers/general_users/assets.controllers');

insuranceRouter.get('/users', getUsers);
insuranceRouter.get('/assets', getAssets);

module.exports = insuranceRouter;
