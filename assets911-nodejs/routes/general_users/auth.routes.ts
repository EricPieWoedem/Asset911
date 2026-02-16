import express from 'express';
import {
  refreshToken,
  socialAuth,
  logOutUser,
  phoneNumberAuthentication,
  verifyUserOTP,
} from '../../controllers/general_users/auth.controllers';

const authRouter = express.Router();

authRouter.post('/', socialAuth);
authRouter.get('/refresh', refreshToken);
authRouter.get('/logout', logOutUser);
authRouter.post('/phone-number', phoneNumberAuthentication);
authRouter.post('/verify-otp', verifyUserOTP);

export default authRouter;
