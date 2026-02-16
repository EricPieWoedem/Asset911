const User = require('../../models/general_users/user.model');
const Asset = require('../../models/general_users/asset.model');
const TransferRecord = require('../../models/general_users/transfer.model');
const mongoose = require('mongoose');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
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
    const userDocument = await User.findById(req.userId);
    if (
      userDocument.provider === 'google' &&
      req.body.email !== userDocument.email
    ) {
      email = userDocument.email;
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...req.body, email },
      {
        new: true,
      }
    );
    if (user) return res.status(200).json('Profile updated');
    res.status(401).json('Failed to update');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const getTotalAssetCountByStatus = async (search, searchField, userId) => {
  const totalAssetCountByStatusPipline = [
    {
      $match: {
        owner: userId,
        [searchField]: { $regex: new RegExp(search, 'i') },
      },
    },
    { $count: 'total' },
  ];

  const totalSoldAssetCount = await Asset.aggregate(
    totalAssetCountByStatusPipline
  );
  return totalSoldAssetCount[0]?.total || 0;
};

const getUserStats = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.userId);
  const field = 'status';

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json('User not found');

    const totalOwned = await getTotalAssetCountByStatus('okay', field, userId);
    const totalSold = await getTotalAssetCountByStatus('sold', field, userId);
    const totalForSale = await getTotalAssetCountByStatus(
      'for sale',
      field,
      userId
    );
    const totalLost = await getTotalAssetCountByStatus('lost', field, userId);

    const transferredAssetsCountPipeline = [
      {
        $match: {
          from: userId,
          status: 'complete',
        },
      },
      { $count: 'total' },
    ];

    const transferredAssetsCount = await TransferRecord.aggregate(
      transferredAssetsCountPipeline
    );
    const totalTransferred = transferredAssetsCount[0]?.total || 0;
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
    const user = await User.findById(req.userId);
    user.deleted = true;
    await user.save();
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
    const filter = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { ghanaCardNumber: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ].filter(Boolean),
      deleted: false,
    };

    const total = await User.countDocuments(filter);
    const userquery = User.find(filter)
      .select('-password -refreshToken -deleted')
      .sort({ name: 1 });
    let users;
    if (pageSize) {
      users = await userquery.limit(pageSize).skip(skip);
    } else {
      users = await userquery;
    }
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
