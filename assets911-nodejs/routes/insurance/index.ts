import express from 'express';
import { getUsers } from '../../controllers/general_users/user.controller';
import { getAssets } from '../../controllers/general_users/assets.controllers';

const insuranceRouter = express.Router();

insuranceRouter.get('/users', getUsers);
insuranceRouter.get('/assets', getAssets);

export default insuranceRouter;
