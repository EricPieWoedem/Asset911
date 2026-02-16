const express = require('express');
const {
  getProfile,
  getUserStats,
  updateProfile,
  deletUserProfile,
} = require('../../controllers/general_users/user.controller');

const userRouter = express.Router();

userRouter.get('/profile', getProfile);
userRouter.delete('/delete', deletUserProfile);
userRouter.get('/stats', getUserStats);
userRouter.patch('/update', updateProfile);

module.exports = userRouter;
