const {
  createAdmin,
  login,
} = require('../../controllers/institutions/auth.controller');
const institutionAuthRouter = require('express').Router();

institutionAuthRouter.post('/register', createAdmin);
institutionAuthRouter.post('/login', login);

module.exports = institutionAuthRouter;
