import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dbConnect from './config/dbConnect';

import authRouter from './routes/general_users/auth.routes';
import assetRouter from './routes/general_users/asset.routes';
import userRouter from './routes/general_users/user.routes';
import publicRouter from './routes/general_users/public.routes';

import ecfatumAuthRouter from './routes/ecfatum/auth.routes';
import ecfatumInstitutionRouter from './routes/ecfatum/institution.routes';
import ecfatumAssetsRouter from './routes/ecfatum/assets.routes';

import institutionAuthRouter from './routes/institutions/auth.routes';
import institutionAssetRouter from './routes/institutions/asset.routes';

import policeAuthRouter from './routes/police/auth.routes';
import policeAssetRouter from './routes/police/assets.routes';

import brandRouter from './routes/brands/index';
import insuranceRouter from './routes/insurance';

import serverSession from './config/serverSession';
import credentials from './config/credentials';
import { corsOptions } from './config/corsOptions';
import { verifyToken, verifyTokenWithPermissions } from './config/jwt';

const PORT = process.env.PORT || 5000;
dotenv.config();
const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/server-session', serverSession);

app.use('/brands', brandRouter);
app.use('/insurance', insuranceRouter);

app.use('/auth', authRouter);
app.use('/public', publicRouter);
app.use('/asset', verifyToken, assetRouter);
app.use('/user', verifyToken, userRouter);

app.use('/ecfatum/auth', ecfatumAuthRouter);
app.use('/ecfatum/institutions', ecfatumInstitutionRouter);
app.use('/ecfatum/assets', ecfatumAssetsRouter);

app.use('/institutions/auth', institutionAuthRouter);
app.use(
  '/institutions/assets',
  verifyTokenWithPermissions,
  institutionAssetRouter
);

app.use('/police/auth', policeAuthRouter);
app.use('/police/assets', policeAssetRouter);

async function start() {
  await dbConnect();
  app.listen(PORT, () => {
    console.log(`Server is running on Port:${PORT}`);
  });
}

start();
