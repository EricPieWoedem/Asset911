import express from 'express';
import {
  getProfile,
  getUserStats,
  updateProfile,
  deletUserProfile,
} from '../../controllers/general_users/user.controller';

const userRouter = express.Router();

userRouter.get('/profile', getProfile);
userRouter.delete('/delete', deletUserProfile);
userRouter.get('/stats', getUserStats);
userRouter.patch('/update', updateProfile);

export default userRouter;
