import express from 'express';
import { loginOfficer, registerOfficer } from '../../controllers/police/auth.controller';

const policeAuthRouter = express.Router();

policeAuthRouter.post('/login', loginOfficer);
policeAuthRouter.post('/register', registerOfficer);

export default policeAuthRouter;
