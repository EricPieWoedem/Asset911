const prisma = require('../../config/prisma');

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json('User not found');
    const profile = {
      name: user?.name,
      profileImage: user?.image,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
      ghanaCardNumber: user?.ghanaCardNumber,
      provider: user?.provider,
    };
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const updateProfile = async (req, res) => {
  let email = req.body.email;
  try {
    const userDocument = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!userDocument) return res.status(404).json('User not found');
    if (
      userDocument.provider === 'google' &&
      req.body.email !== userDocument.email
    ) {
      email = userDocument.email;
    }
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { ...req.body, email },
    });
    if (user) return res.status(200).json('Profile updated');
    res.status(401).json('Failed to update');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const getTotalAssetCountByStatus = async (status, userId) => {
  return prisma.asset.count({
    where: {
      ownerId: userId,
      status,
    },
  });
};

const getUserStats = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json('User not found');

    const totalOwned = await getTotalAssetCountByStatus('okay', req.userId);
    const totalSold = await getTotalAssetCountByStatus('sold', req.userId);
    const totalForSale = await getTotalAssetCountByStatus('for_sale', req.userId);
    const totalLost = await getTotalAssetCountByStatus('lost', req.userId);

    const totalTransferred = await prisma.transferRecord.count({
      where: {
        fromId: req.userId,
        status: 'confirmed',
      },
    });
    const totalAssets = totalOwned + totalSold + totalLost + totalForSale;

    const statsObject = {
      totalAssets,
      totalSold,
      totalLost,
      totalTransferred,
    };
    res.status(200).json(statsObject);
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const deletUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { deleted: true },
    });
    if (!user) return res.status(404).json('User not found');
    res.status(200).json('Profile Deleted');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const getUsers = async (req, res) => {
  const search = req.query.search || '';
  const pageSize = req.query.pageSize;
  const pageNumber = req.query.pageNumber || 1;
  const skip = (pageNumber - 1) * pageSize;

  try {
    const where = {
      deleted: false,
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { ghanaCardNumber: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
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

module.exports = {
  getProfile,
  getUserStats,
  updateProfile,
  deletUserProfile,
  getUsers,
};
