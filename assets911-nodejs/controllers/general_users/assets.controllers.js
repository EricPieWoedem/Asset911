const Asset = require('../../models/general_users/asset.model');
const DeletedAsset = require('../../models/general_users/deletedAsset.model');
const User = require('../../models/general_users/user.model');
const TransferAsset = require('../../models/general_users/transfer.model');
const {
  generateOTP,
  createTransferToken,
  verifyTransferToken,
} = require('../../config/otp');
const { sendSMS } = require('../../utils/sms');
const { sendEmail } = require('../../utils/email');
const mongoose = require('mongoose');

const ghanaPhoneNumberRegex =
  /^(?:(?:\+|00)233|0)([23456]\d{8}|[2359]([35]3|[49]9)\d{7})$/;
//user specifc asset Actions

const addAsset = async (req, res) => {
  console.log(req.userId);
  try {
    const existingAsset = await Asset.findOne({
      uniqueNumber: req.body.uniqueNumber,
    });

    if (existingAsset) {
      return res.status(409).json('Asset already exists');
    } else {
      const newAsset = await Asset.create({
        ...req.body,
        status: 'okay',
        owner: req.userId,
        name: `${req.body.brand} ${req.body.model}`,
      });

      if (newAsset) {
        const userDetails = await User.findById(req.userId);
        const message = `Your asset ${newAsset.name} with unique number ${newAsset.uniqueNumber} has been added to your portfolio.`;
        if (userDetails.phoneNumber) {
          await sendSMS(userDetails.phoneNumber, message);
          userDetails.email &&
            (await sendEmail(userDetails.email, 'New Asset', message));
        } else {
          await sendEmail(userDetails.email, 'New Asset', message);
        }
        res.status(200).json('Asset Created');
      } else {
        res.status(400).json('Failed to create asset');
      }
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const updateAsset = async (req, res) => {
  try {
    const updatedAsset = await Asset.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { ...req.body },
      { new: true }
    );
    if (updatedAsset) {
      res.status(200).json('Asset Updated');
    } else {
      res
        .status(400)
        .json(
          'Failed to update asset, confirm if user is the owner of the asset'
        );
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

//Asset Transfer

const transferAsset = async (req, res) => {
  const { newOwner, notes, transferDate } = req.body;
  const otp = generateOTP(4);
  const otpToken = createTransferToken(otp);

  try {
    const asset = await Asset.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!asset) return res.status(404).json('Asset not found');

    let existingUser;
    if (!ghanaPhoneNumberRegex.test(newOwner)) {
      existingUser = await User.findOne({ email: newOwner });
    } else {
      existingUser = await User.findOne({ phoneNumber: newOwner });
    }

    let transferRecord;
    if (!existingUser) {
      transferRecord = await TransferAsset.create({
        assetId: req.params.id,
        from: req.userId,
        notAnExistingUser: newOwner,
        confirmationCode: otpToken,
        notes,
        transferDate,
      });
    } else {
      transferRecord = await TransferAsset.create({
        assetId: req.params.id,
        from: req.userId,
        to: existingUser.id,
        confirmationCode: otpToken,
        notes,
        transferDate,
      });
    }

    if (!transferRecord) {
      return res.status(400).json('Failed to transfer asset');
    }

    asset.recentTransferRecord = transferRecord.id;
    const result = await asset.save();

    if (!result) return res.status(400).json('Failed to transfer asset');

    const presentOwner = await User.findById(req.userId);
    const message = `Please give the following code ${otp} to the new owner of your ${asset.brand} ${asset.model} with serial no. ${asset.uniqueNumber}`;
    if (presentOwner.phoneNumber) {
      await sendSMS(presentOwner.phoneNumber, message);
      presentOwner.email &&
        (await sendEmail(presentOwner.email, 'Asset Transfer', message));
    } else {
      await sendEmail(presentOwner.email, 'Asset Transfer', message);
    }

    const newOwnerMessage = `You have been transferred a ${asset.brand} ${asset.model} from ${presentOwner.name} with serial no. ${asset.uniqueNumber}. Login at https://asset911.com`;
    if (ghanaPhoneNumberRegex.test(newOwner)) {
      await sendSMS(newOwner, newOwnerMessage);
    } else {
      await sendEmail(newOwner, 'Asset Transfer', newOwnerMessage);
    }

    res.status(200).json(otp);
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const cancelAssetTransfer = async (req, res) => {
  try {
    const transferToCancel = await TransferAsset.findById(req.params.id);
    if (!transferToCancel)
      return res.status(404).json('Transfer record not found');
    if (transferToCancel.from.toString() !== req.userId) {
      return res.status(401).json('Unauthorized');
    }
    transferToCancel.status = 'cancelled';
    const result = await transferToCancel.save();
    if (result) return res.status(200).json('Transfer cancelled');
    res.status(400).json('Failed to cancel transfer');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const confirmTransfer = async (req, res) => {
  const { code } = req.body;
  const assetId = req.params.id;
  try {
    const user = await User.findById(req.userId);
    const asset = await Asset.findById(assetId);

    if (!asset) return res.status(404).json('Asset not found');
    const transferRecord = await TransferAsset.findOne({
      assetId,
      _id: asset.recentTransferRecord,
    });

    if (!transferRecord) {
      return res.status(404).json('Transfer record not found');
    }

    if (
      req.userId != transferRecord.to?.toString() &&
      user.phoneNumber !== transferRecord.notAnExistingUser
    ) {
      return res.status(401).json('Unauthorized');
    }

    if (code !== verifyTransferToken(transferRecord.confirmationCode)) {
      return res.status(400).json('Incorrect code');
    }

    asset.owner = req.userId;
    transferRecord.to = req.userId;
    transferRecord.status = 'complete';

    const updatedAsset = await asset.save();
    const updatedTransferRecord = await transferRecord.save();

    if (updatedAsset && updatedTransferRecord) {
      return res.status(200).json('Asset transferred');
    } else {
      res.status(400).json('Failed to transfer asset');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const resendTransferConfirmationCode = async (req, res) => {
  const otp = generateOTP(4);
  const otpToken = createTransferToken(otp);
  try {
    const transferRecord = await TransferAsset.findById(req.params.id);
    if (!transferRecord) {
      return res.status(404).json('Transfer record not found');
    }

    if (transferRecord.from._id.toString() !== req.userId) {
      return res.status(401).json('Unauthorized');
    }

    transferRecord.confirmationCode = otpToken;
    const updatedTransferRecord = await transferRecord.save();
    if (!updatedTransferRecord) {
      return res.status(400).json('Failed to generate otp');
    }

    const presentOwner = await User.findById(req.userId);
    const message = `Your new transfer confirmation code is ${otp}`;

    console.log(message);

    if (presentOwner.phoneNumber) {
      await sendSMS(presentOwner.phoneNumber, message);
      presentOwner.email &&
        (await sendEmail(presentOwner.email, 'Asset Transfer', message));
    } else {
      await sendEmail(presentOwner.email, 'Asset Transfer', message);
    }

    res.status(200).json('Otp sent');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getTransferredAssets = async (req, res) => {
  let pageNumber = req.query.pageNumber || 1;
  let pageSize = req.query.pageSize || 10;
  const search = req.query.search || '.*';
  const userId = new mongoose.Types.ObjectId(req.userId);

  try {
    const countPipeline = [
      {
        $match: {
          from: userId,
        },
      },
      {
        $lookup: {
          from: 'assets',
          localField: 'assetId',
          foreignField: '_id',
          as: 'asset',
        },
      },
      { $unwind: '$asset' },
      { $match: { 'asset.uniqueNumber': { $regex: new RegExp(search, 'i') } } },
      { $count: 'total' },
    ];

    const countResult = await TransferAsset.aggregate(countPipeline);

    if (!countResult[0]) {
      return res.status(404).json('No assets found');
    }

    const total = countResult[0].total;

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const retrievalPipeline = [
      {
        $match: {
          from: userId,
        },
      },
      {
        $lookup: {
          from: 'assets',
          localField: 'assetId',
          foreignField: '_id',
          as: 'asset',
        },
      },
      { $unwind: '$asset' },
      { $match: { 'asset.uniqueNumber': { $regex: new RegExp(search, 'i') } } },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];

    const results = await TransferAsset.aggregate(retrievalPipeline);

    if (!results[0]) {
      return res.status(404).json('No assets found');
    }

    const totalPages = Math.ceil(total / pageSize);
    res.json({
      transferredAssets: results,
      totalPages,
      currentPage: pageNumber,
      count: total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getRecievedAssets = async (req, res) => {
  let pageNumber = req.query.pageNumber || 1;
  let pageSize = req.query.pageSize || 10;
  const search = req.query.search || '.*';
  const userId = new mongoose.Types.ObjectId(req.userId);

  try {
    const user = await User.findById(req.userId);
    const countPipeline = [
      {
        $match: {
          $or: [
            { notAnExistingUser: user?.phoneNumber || user?.email },
            { to: userId },
          ],
        },
      },
      {
        $lookup: {
          from: 'assets',
          localField: 'assetId',
          foreignField: '_id',
          as: 'asset',
        },
      },
      { $unwind: '$asset' },
      { $match: { 'asset.uniqueNumber': { $regex: new RegExp(search, 'i') } } },
      { $count: 'total' },
    ];

    const countResult = await TransferAsset.aggregate(countPipeline);
    if (!countResult[0]) {
      return res.status(404).json('No assets found');
    }

    const total = countResult[0].total;

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const retrievalPipeline = [
      {
        $match: {
          $or: [
            { notAnExistingUser: user?.phoneNumber || user?.email },
            { to: userId },
          ],
        },
      },
      {
        $lookup: {
          from: 'assets',
          localField: 'assetId',
          foreignField: '_id',
          as: 'asset',
        },
      },
      { $unwind: '$asset' },
      { $match: { 'asset.uniqueNumber': { $regex: new RegExp(search, 'i') } } },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];

    const results = await TransferAsset.aggregate(retrievalPipeline);

    if (!results[0]) {
      return res.status(404).json('No assets found');
    }

    const totalPages = Math.ceil(total / pageSize);
    res.json({
      recievedAssets: results,
      totalPages,
      currentPage: pageNumber,
      count: total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getSingleTransferRecord = async (req, res) => {
  try {
    const transferRecord = await TransferAsset.findById(req.params.id)
      .populate('assetId')
      .populate({
        path: 'to',
        select: ['-refreshToken', '-provider', '-password'],
      })
      .populate({
        path: 'from',
        select: ['-refreshToken', '-provider', '-password'],
      });
    if (!transferRecord) {
      return res.status(404).json('Transfer record not found');
    }
    res.status(200).json(transferRecord);
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const changeAssetStatus = async (req, res) => {
  try {
    const updatedAsset = await Asset.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (updatedAsset) {
      res.status(200).json({ updatedAsset });
    } else {
      res
        .status(400)
        .json(
          'Failed to update asset,confirm if the user is the owner of the asset'
        );
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getAllUserAssets = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let search = req.query?.search || '';
  const userId = new mongoose.Types.ObjectId(req.userId);

  try {
    // Pipeline for counting total documents
    const countPipeline = [
      {
        $match: {
          owner: userId,
          $or: [
            { uniqueNumber: { $regex: new RegExp(search, 'i') } },
            { name: { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
      { $count: 'total' },
    ];

    const countResult = await Asset.aggregate(countPipeline);

    if (!countResult[0]) {
      return res.status(404).json('No assets found');
    }

    const total = countResult[0].total;

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }
    // Pipeline for retrieving paginated results
    const retrievalPipeline = [
      {
        $match: {
          owner: userId,
          $or: [
            { uniqueNumber: { $regex: new RegExp(search, 'i') } },
            { name: { $regex: new RegExp(search, 'i') } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];

    const results = await Asset.aggregate(retrievalPipeline);

    if (!results[0]) {
      return res.status(404).json('No assets found hi');
    }

    const totalPages = Math.ceil(total / pageSize);
    res.json({
      assets: results,
      totalPages,
      currentPage: pageNumber,
      count: total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const deleteAsset = async (req, res) => {
  try {
    const assetToDelete = await Asset.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!assetToDelete)
      return res
        .status(404)
        .json(
          'Failed to delete Asset, confirm if the user is the owner of the asset '
        );
    const transformedAssetObject = assetToDelete.toObject();

    const movedToDeleteCollection = await DeletedAsset.create({
      ...transformedAssetObject,
      deleted: new Date(),
    });

    if (movedToDeleteCollection) {
      const deletedAsset = await Asset.findOneAndDelete({
        _id: req.params.id,
        owner: req.userId,
      });
      if (deletedAsset) {
        return res.status(200).json({ deletedAsset, movedToDeleteCollection });
      }
    } else {
      return res.status(409).json('Failed to delete asset, please try again');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getSingleAssetUser = async (req, res) => {
  try {
    const asset = await Asset.findOne({
      uniqueNumber: req.params.id,
      owner: req.userId,
    }).populate('owner');
    if (!asset) res.status(404).json('Asset not found');
    res.status(200).json({ asset });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getSingleAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('owner');
    if (!asset) return res.status(404).json('Asset not found');
    res.status(200).json({ asset });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find().populate('owner').exec();
    res.status(200).json({ assets });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const generateDummyData = async (req, res) => {
  const getRandomAsset = () => {
    const assetTypes = [
      'Car',
      'Phone',
      'Laptop',
      'Tablet',
      'Watch',
      'Headphones',
      'Camera',
    ];

    const getRandomType = () => {
      const randomIndex = Math.floor(Math.random() * assetTypes.length);
      return assetTypes[randomIndex];
    };

    const getRandomString = (length = 5) => {
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
      }
      return result;
    };

    const getRandomNumber = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const getRandomDate = () => {
      const startDate = new Date(2000, 0, 1).getTime();
      const endDate = new Date().getTime();
      const randomDate = new Date(
        startDate + Math.random() * (endDate - startDate)
      );
      return randomDate.toISOString().split('T')[0];
    };

    return {
      model: getRandomString(),
      brand: getRandomString(),
      type: getRandomType(),
      uniqueNumber: getRandomString(8),
      dateOfPurchase: getRandomDate(),
      price: getRandomNumber(100, 5000),
      purchaseReciept: getRandomString(),
      identificationDetails: getRandomString(),
      otherDetails: getRandomString(),
      images: [
        'https://res.cloudinary.com/jhay/image/upload/v1699013243/br7lywtwczk0436y7uae.png',
      ],
      registrationAddress: getRandomString(),
      status: ['lost', 'sold', 'okay', 'damaged', 'for sale'][
        getRandomNumber(0, 4)
      ],
    };
  };

  try {
    for (let i = 0; i < req.body.length; i++) {
      const randomAsset = getRandomAsset();
      await Asset.create({
        ...randomAsset,
        owner: req.userId,
      });
      if (i === req.body.length - 1) {
        return res.status(201).json('Data generated successfully');
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getAssets = async (req, res) => {
  const search = req.query.search || '';
  const owner = req.query.owner;
  const pageSize = req.query.pageSize;
  const pageNumber = req.query.pageNumber || 1;
  const skip = (pageNumber - 1) * pageSize;
  try {
    const filter = {
      $or: [
        { model: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { uniqueNumber: { $regex: search, $options: 'i' } },
      ].filter(Boolean),
    };
    if (owner) {
      filter.owner = owner;
    }

    const total = await Asset.countDocuments(filter);
    const assetQuery = Asset.find(filter).sort({ createdAt: -1 });
    let assets;
    if (pageSize) {
      assets = await assetQuery.limit(pageSize).skip(skip);
    } else {
      assets = await assetQuery;
    }
    res.status(200).json({ assets, pageNumber, total });
  } catch (error) {
    res.status(500).json(error);
  }
};
module.exports = {
  addAsset,
  changeAssetStatus,
  getAllAssets,
  getAllUserAssets,
  transferAsset,
  updateAsset,
  deleteAsset,
  getSingleAsset,
  getSingleAssetUser,
  confirmTransfer,
  getTransferredAssets,
  getRecievedAssets,
  getSingleTransferRecord,
  resendTransferConfirmationCode,
  generateDummyData,
  cancelAssetTransfer,
  getAssets,
};
