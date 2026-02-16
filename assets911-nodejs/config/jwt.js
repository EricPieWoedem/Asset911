const { sign, verify, decode } = require('jsonwebtoken');

const createToken = user => {
  const accessToken = sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      ghanaCardNumber: user?.ghanaCardNumber || '',
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const refreshToken = sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '2d',
  });
  return { accessToken, refreshToken };
};

const verifyToken = (req, res, next) => {
  if (process.env.BYPASS_AUTH === 'true') {
    req.userId = 'dev-user-id';
    req.user = {
      id: 'dev-user-id',
      name: 'Dev User',
      email: 'dev@user.com',
    };
    return next();
  }

  const bearer = req.headers.authorization || req.headers.Authorization;
  if (!bearer)
    return res.status(401).json({ message: 'Authorization header missing' });

  const accessToken = bearer.split(' ')[1];
  if (!accessToken)
    return res.status(401).json({ message: 'Access token missing' });

  try {
    const valid = verify(accessToken, process.env.JWT_SECRET);
    if (valid) {
      req.userId = valid.id;
      next();
    } else {
      return res.status(401).json({ message: 'Invalid access token' });
    }
  } catch (error) {
    res.status(401).json('Invalid token');
  }
};

const verifyRefreshToken = (refreshToken, user) => {
  const valid = verify(refreshToken, process.env.JWT_SECRET);
  if (!valid) return res.status(403).send('Forbidden');
  return valid.id === user.id;
};

const createTokenWithPermissions = admin => {
  const accessToken = sign(
    {
      email: admin.email,
      name: admin.name,
      id: admin.id,
      permissions: admin.permissions,
      institutionId: admin.institutionId.id || admin.institutionId,
      institutionName: admin.institutionId.name || admin.institutionId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const refreshToken = sign(
    { id: admin.id, permissions: admin.permissions },
    process.env.JWT_SECRET,
    {
      expiresIn: '2d',
    }
  );
  return { accessToken, refreshToken };
};

const verifyTokenWithPermissions = (req, res, next) => {
  if (process.env.BYPASS_AUTH === 'true') {
    req.userId = 'dev-admin-id';
    req.permissions = [201, 302, 203];
    req.institutionId = 'dev-institution-id';
    req.user = {
      id: 'dev-admin-id',
      name: 'Dev Admin',
      email: 'dev@admin.com',
      permissions: [201, 302, 203],
      institutionId: 'dev-institution-id',
    };
    return next();
  }

  const bearer = req.headers.authorization || req.headers.Authorization;
  if (!bearer) return res.status(401).json('Authorization header missing');

  const accessToken = bearer.split(' ')[1];
  if (!accessToken) return res.status(401).json('Access token missing');

  try {
    const valid = verify(accessToken, process.env.JWT_SECRET);
    if (valid) {
      req.userId = valid.id;
      req.permissions = valid.permissions;
      req.institutionId = valid.institutionId;
      next();
    } else {
      return res.status(401).json('Invalid access token');
    }
  } catch (error) {
    res.status(401).json('Invalid access token');
  }
};

module.exports = {
  createToken,
  verifyToken,
  decode,
  verifyRefreshToken,
  verifyTokenWithPermissions,
  createTokenWithPermissions,
};
