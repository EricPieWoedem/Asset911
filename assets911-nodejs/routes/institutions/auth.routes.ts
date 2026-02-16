import express from 'express';
import { createAdmin, login } from '../../controllers/institutions/auth.controller';

const institutionAuthRouter = express.Router();

institutionAuthRouter.post('/register', createAdmin);
institutionAuthRouter.post('/login', login);

export default institutionAuthRouter;
