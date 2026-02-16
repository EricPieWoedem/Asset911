const {
  loginOfficer,
  registerOfficer,
} = require('../../controllers/police/auth.controller');

const policeAuthRouter = require('express').Router();

policeAuthRouter.post('/login', loginOfficer);
policeAuthRouter.post('/register', registerOfficer);

module.exports = policeAuthRouter;
