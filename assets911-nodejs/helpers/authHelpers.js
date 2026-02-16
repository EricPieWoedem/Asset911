const sendRefreshToken = (res, refreshToken) => {
  res.cookie('jrft', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
  });
};

module.exports = {
  sendRefreshToken,
};
