const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/dbConnect');

//general_users
const authRouter = require('./routes/general_users/auth.routes');
const assetRouter = require('./routes/general_users/asset.routes');
const userRouter = require('./routes/general_users/user.routes');
const publicRouter = require('./routes/general_users/public.routes');
//ecfatum
const ecfatumAuthRouter = require('./routes/ecfatum/auth.routes');
const ecfatumInstitutionRouter = require('./routes/ecfatum/institution.routes');
const ecfatumAssetsRouter = require('./routes/ecfatum/assets.routes');
//institutions
const institutionAuthRouter = require('./routes/institutions/auth.routes');
const institutionAssetRouter = require('./routes/institutions/asset.routes');

//police
const policeAuthRouter = require('./routes/police/auth.routes');
const policeAssetRouter = require('./routes/police/assets.routes');

//brands
const brandRouter = require('./routes/brands/index');

//insurance
const insuranceRouter = require('./routes/insurance');

const serverSession = require('./config/serverSession');
const credentials = require('./config/credentials');
const { corsOptions } = require('./config/corsOptions');
const { verifyToken, verifyTokenWithPermissions } = require('./config/jwt');

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

//brands routes
app.use('/brands', brandRouter);

//insurance routes
app.use('/insurance', insuranceRouter);

// public routes
app.use('/auth', authRouter);
app.use('/public', publicRouter);
app.use('/asset', verifyToken, assetRouter);
app.use('/user', verifyToken, userRouter);

//ecfatum routes
app.use('/ecfatum/auth', ecfatumAuthRouter);
app.use('/ecfatum/institutions', ecfatumInstitutionRouter);
app.use('/ecfatum/assets', ecfatumAssetsRouter);

//institution routes
app.use('/institutions/auth', institutionAuthRouter);
app.use(
  '/institutions/assets',
  verifyTokenWithPermissions,
  institutionAssetRouter
);

//police routes
app.use('/police/auth', policeAuthRouter);
app.use('/police/assets', policeAssetRouter);

async function start() {
  await dbConnect();
  app.listen(PORT, () => {
    console.log(`Server is running on Port:${PORT}`);
  });
}

start();
