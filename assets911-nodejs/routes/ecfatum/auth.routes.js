const express = require('express');
const {
  createSuperAdmin,
  loginSuperAdmin,
} = require('../../controllers/ecfatum/auth.controller');
const {
  checkExistingUsers,
} = require('../../controllers/ecfatum/user.controller');

const ecfatumAuthRouter = express.Router();

ecfatumAuthRouter.post('/create', createSuperAdmin);
ecfatumAuthRouter.post('/login', loginSuperAdmin);
ecfatumAuthRouter.post('/getUsers', checkExistingUsers);

module.exports = ecfatumAuthRouter;
