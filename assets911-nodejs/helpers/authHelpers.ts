import { Response } from 'express';

export const sendRefreshToken = (res: Response, refreshToken: string) => {
  res.cookie('jrft', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
  });
};
