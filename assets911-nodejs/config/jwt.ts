import { sign, verify, decode, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface UserPayload {
  id: string;
  name?: string | null;
  email?: string | null;
  ghanaCardNumber?: string | null;
}

interface AdminPayload {
  id: string;
  name: string;
  email: string;
  permissions?: number[];
  institutionId?: string | { id?: string; name?: string };
  institutionName?: string;
}

export const createToken = (user: UserPayload) => {
  const accessToken = sign(
    {
      id: user.id,
      name: user.name ?? '',
      email: user.email ?? '',
      ghanaCardNumber: user?.ghanaCardNumber ?? '',
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );
  const refreshToken = sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '2d' });
  return { accessToken, refreshToken };
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization || req.headers.Authorization;
  if (!bearer) return res.status(401).json({ message: 'Authorization header missing' });
  const accessToken = (bearer as string).split(' ')[1];
  if (!accessToken) return res.status(401).json({ message: 'Access token missing' });
  try {
    const valid = verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;
    if (valid) {
      (req as Request & { userId: string }).userId = valid.id as string;
      next();
    } else {
      return res.status(401).json({ message: 'Invalid access token' });
    }
  } catch {
    res.status(401).json('Invalid token');
  }
};

export const verifyRefreshToken = (refreshToken: string, user: { id: string }): boolean => {
  const valid = verify(refreshToken, process.env.JWT_SECRET!) as JwtPayload;
  if (!valid) return false;
  return valid.id === user.id;
};

export const createTokenWithPermissions = (admin: AdminPayload & { institutionId?: { id?: string; name?: string } | string | unknown }) => {
  const inst = admin.institutionId;
  const instObj = inst && typeof inst === 'object' && 'id' in inst ? inst : { id: String(inst ?? ''), name: '' };
  const accessToken = sign(
    {
      email: admin.email,
      name: admin.name,
      id: admin.id,
      permissions: admin.permissions ?? [],
      institutionId: (instObj as { id?: string }).id ?? String(inst ?? ''),
      institutionName: (instObj as { name?: string }).name ?? '',
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );
  const refreshToken = sign(
    { id: admin.id, permissions: admin.permissions },
    process.env.JWT_SECRET!,
    { expiresIn: '2d' }
  );
  return { accessToken, refreshToken };
};

export const verifyTokenWithPermissions = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization || req.headers.Authorization;
  if (!bearer) return res.status(401).json('Authorization header missing');
  const accessToken = (bearer as string).split(' ')[1];
  if (!accessToken) return res.status(401).json('Access token missing');
  try {
    const valid = verify(accessToken, process.env.JWT_SECRET!) as JwtPayload & { permissions?: number[]; institutionId?: string };
    if (valid) {
      (req as Request & { userId: string }).userId = valid.id as string;
      (req as Request & { permissions: number[] }).permissions = valid.permissions ?? [];
      (req as Request & { institutionId: string }).institutionId = valid.institutionId ?? '';
      next();
    } else {
      return res.status(401).json('Invalid access token');
    }
  } catch {
    res.status(401).json('Invalid access token');
  }
};

export { decode };
