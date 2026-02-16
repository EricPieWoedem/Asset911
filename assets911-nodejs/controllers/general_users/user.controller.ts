import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { queryNum, queryStr } from '../../utils/request';

type AuthReq = Request & { userId: string };

const getTotalAssetCountByStatus = async (status: import('@prisma/client').AssetStatus, userId: string) =>
  prisma.asset.count({ where: { ownerId: userId, status } });

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json('User not found');
    res.status(200).json({
      name: user?.name,
      profileImage: user?.image,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
      ghanaCardNumber: user?.ghanaCardNumber,
      provider: user?.provider,
    });
  } catch {
    res.status(500).json('Internal server error');
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  let email = req.body.email;
  try {
    const userId = (req as AuthReq).userId;
    const userDocument = await prisma.user.findUnique({ where: { id: userId } });
    if (!userDocument) return res.status(404).json('User not found');
    if (userDocument.provider === 'google' && req.body.email !== userDocument.email) {
      email = userDocument.email;
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { ...req.body, email },
    });
    if (user) return res.status(200).json('Profile updated');
    res.status(401).json('Failed to update');
  } catch {
    res.status(500).json('Internal server error');
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json('User not found');
    const totalOwned = await getTotalAssetCountByStatus('okay', userId);
    const totalSold = await getTotalAssetCountByStatus('sold', userId);
    const totalForSale = await getTotalAssetCountByStatus('for_sale', userId);
    const totalLost = await getTotalAssetCountByStatus('lost', userId);
    const totalTransferred = await prisma.transferRecord.count({
      where: { fromId: userId, status: 'confirmed' },
    });
    const totalAssets = totalOwned + totalSold + totalLost + totalForSale;
    res.status(200).json({ totalAssets, totalSold, totalLost, totalTransferred });
  } catch {
    res.status(500).json('Internal server error');
  }
};

export const deletUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).userId;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { deleted: true },
    });
    if (!user) return res.status(404).json('User not found');
    res.status(200).json('Profile Deleted');
  } catch {
    res.status(500).json('Internal server error');
  }
};

export const getUsers = async (req: Request, res: Response) => {
  const search = queryStr(req.query.search, '');
  const pageSize = queryNum(req.query.pageSize, 0) || undefined;
  const pageNumber = queryNum(req.query.pageNumber, 1);
  const skip = (pageNumber - 1) * (pageSize || 0);
  try {
    const where = {
      deleted: false,
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { ghanaCardNumber: { contains: search, mode: 'insensitive' as const } },
        { phoneNumber: { contains: search, mode: 'insensitive' as const } },
      ],
    };
    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        provider: true,
        phoneNumber: true,
        ghanaCardNumber: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
      ...(pageSize ? { take: Number(pageSize), skip } : {}),
    });
    res.status(200).json({ users, pageNumber, total });
  } catch (error) {
    res.status(500).json(error);
  }
};
