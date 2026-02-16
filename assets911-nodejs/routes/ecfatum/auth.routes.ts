import express from 'express';
import { createSuperAdmin, loginSuperAdmin } from '../../controllers/ecfatum/auth.controller';
import { checkExistingUsers } from '../../controllers/ecfatum/user.controller';

const ecfatumAuthRouter = express.Router();

ecfatumAuthRouter.post('/create', createSuperAdmin);
ecfatumAuthRouter.post('/login', loginSuperAdmin);
ecfatumAuthRouter.post('/getUsers', checkExistingUsers);

export default ecfatumAuthRouter;
