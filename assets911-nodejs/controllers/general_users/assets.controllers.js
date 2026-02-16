const prisma = require('../../config/prisma');
const {
  generateOTP,
  createTransferToken,
  verifyTransferToken,
} = require('../../config/otp');
const { sendSMS } = require('../../utils/sms');
const { sendEmail } = require('../../utils/email');

const ghanaPhoneNumberRegex =
  /^(?:(?:\+|00)233|0)([23456]\d{8}|[2359]([35]3|[49]9)\d{7})$/;

const toDbStatus = status => {
  if (status === 'for sale') return 'for_sale';
  return status;
};

const fromDbStatus = status => {
  if (status === 'for_sale') return 'for sale';
  return status;
};

const mapAssetForResponse = asset => ({
  ...asset,
  status: fromDbStatus(asset.status),
  purchaseReciept: asset.purchaseReceipt,
});

const addAsset = async (req, res) => {
  try {
    const existingAsset = await prisma.asset.findUnique({
      where: { uniqueNumber: req.body.uniqueNumber },
    });

    if (existingAsset) return res.status(409).json('Asset already exists');

    const newAsset = await prisma.asset.create({
      data: {
        model: req.body.model,
        brand: req.body.brand,
        name: `${req.body.brand} ${req.body.model}`,
        type: req.body.type,
        categoryType: req.body.categoryType || null,
        uniqueNumber: req.body.uniqueNumber,
        dateOfPurchase: req.body.dateOfPurchase,
        price: Number(req.body.price),
        purchaseReceipt: req.body.purchaseReceipt || req.body.purchaseReciept || null,
        identificationDetails: req.body.identificationDetails,
        otherDetails: req.body.otherDetails || null,
        images: req.body.images || [],
        registrationAddress: req.body.registrationAddress,
        presentLocation: req.body.presentLocation || null,
        status: 'okay',
        additionalCategoryData: req.body.additionalCategoryData || undefined,
        ownerId: req.userId,
      },
    });

    const userDetails = await prisma.user.findUnique({ where: { id: req.userId } });
    const message = `Your asset ${newAsset.name} with unique number ${newAsset.uniqueNumber} has been added to your portfolio.`;
    if (userDetails?.phoneNumber) {
      await sendSMS(userDetails.phoneNumber, message);
      if (userDetails.email) await sendEmail(userDetails.email, 'New Asset', message);
    } else if (userDetails?.email) {
      await sendEmail(userDetails.email, 'New Asset', message);
    }
    return res.status(200).json('Asset Created');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const updateAsset = async (req, res) => {
  try {
    const existing = await prisma.asset.findFirst({
      where: { id: req.params.id, ownerId: req.userId },
    });
    if (!existing) {
      res
        .status(400)
        .json(
          'Failed to update asset, confirm if user is the owner of the asset'
        );
      return;
    }

    const data = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(data, 'status')) {
      data.status = toDbStatus(data.status);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'purchaseReciept')) {
      data.purchaseReceipt = data.purchaseReciept;
      delete data.purchaseReciept;
    }

    await prisma.asset.update({
      where: { id: req.params.id },
      data,
    });
    res.status(200).json('Asset Updated');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const transferAsset = async (req, res) => {
  const { newOwner, notes, transferDate } = req.body;
  const otp = generateOTP(4);
  const otpToken = createTransferToken(otp);

  try {
    const asset = await prisma.asset.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.userId,
      },
    });

    if (!asset) return res.status(404).json('Asset not found');

    let existingUser;
    if (!ghanaPhoneNumberRegex.test(newOwner)) {
      existingUser = await prisma.user.findFirst({ where: { email: newOwner } });
    } else {
      existingUser = await prisma.user.findFirst({ where: { phoneNumber: newOwner } });
    }

    let transferRecord;
    if (!existingUser) {
      transferRecord = await prisma.transferRecord.create({
        data: {
          assetId: req.params.id,
          fromId: req.userId,
          notAnExistingUser: newOwner,
          confirmationCode: otpToken,
          notes,
          transferDate,
        },
      });
    } else {
      transferRecord = await prisma.transferRecord.create({
        data: {
          assetId: req.params.id,
          fromId: req.userId,
          toId: existingUser.id,
          confirmationCode: otpToken,
          notes,
          transferDate,
        },
      });
    }

    if (!transferRecord) {
      return res.status(400).json('Failed to transfer asset');
    }

    await prisma.asset.update({
      where: { id: req.params.id },
      data: { recentTransferRecordId: transferRecord.id },
    });

    const presentOwner = await prisma.user.findUnique({ where: { id: req.userId } });
    const message = `Please give the following code ${otp} to the new owner of your ${asset.brand} ${asset.model} with serial no. ${asset.uniqueNumber}`;
    if (presentOwner?.phoneNumber) {
      await sendSMS(presentOwner.phoneNumber, message);
      if (presentOwner.email) {
        await sendEmail(presentOwner.email, 'Asset Transfer', message);
      }
    } else if (presentOwner?.email) {
      await sendEmail(presentOwner.email, 'Asset Transfer', message);
    }

    const newOwnerMessage = `You have been transferred a ${asset.brand} ${asset.model} from ${presentOwner?.name || 'an owner'} with serial no. ${asset.uniqueNumber}. Login at https://asset911.com`;
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
    const transferToCancel = await prisma.transferRecord.findUnique({
      where: { id: req.params.id },
    });
    if (!transferToCancel)
      return res.status(404).json('Transfer record not found');
    if (transferToCancel.fromId !== req.userId) {
      return res.status(401).json('Unauthorized');
    }
    await prisma.transferRecord.update({
      where: { id: transferToCancel.id },
      data: { status: 'cancelled' },
    });
    return res.status(200).json('Transfer cancelled');
    res.status(400).json('Failed to cancel transfer');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const confirmTransfer = async (req, res) => {
  const { code } = req.body;
  const assetId = req.params.id;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });

    if (!asset) return res.status(404).json('Asset not found');
    const transferRecord = await prisma.transferRecord.findFirst({
      where: {
        assetId,
        id: asset.recentTransferRecordId,
      },
    });

    if (!transferRecord) {
      return res.status(404).json('Transfer record not found');
    }

    if (
      req.userId !== transferRecord.toId &&
      user?.phoneNumber !== transferRecord.notAnExistingUser
    ) {
      return res.status(401).json('Unauthorized');
    }

    if (code !== verifyTransferToken(transferRecord.confirmationCode)) {
      return res.status(400).json('Incorrect code');
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: asset.id },
      data: { ownerId: req.userId },
    });
    const updatedTransferRecord = await prisma.transferRecord.update({
      where: { id: transferRecord.id },
      data: { toId: req.userId, status: 'confirmed' },
    });

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
    const transferRecord = await prisma.transferRecord.findUnique({
      where: { id: req.params.id },
    });
    if (!transferRecord) {
      return res.status(404).json('Transfer record not found');
    }

    if (transferRecord.fromId !== req.userId) {
      return res.status(401).json('Unauthorized');
    }

    await prisma.transferRecord.update({
      where: { id: transferRecord.id },
      data: { confirmationCode: otpToken },
    });

    const presentOwner = await prisma.user.findUnique({ where: { id: req.userId } });
    const message = `Your new transfer confirmation code is ${otp}`;

    if (presentOwner?.phoneNumber) {
      await sendSMS(presentOwner.phoneNumber, message);
      if (presentOwner.email) {
        await sendEmail(presentOwner.email, 'Asset Transfer', message);
      }
    } else if (presentOwner?.email) {
      await sendEmail(presentOwner.email, 'Asset Transfer', message);
    }

    res.status(200).json('Otp sent');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getTransferredAssets = async (req, res) => {
  let pageNumber = Number(req.query.pageNumber || 1);
  let pageSize = Number(req.query.pageSize || 10);
  const search = req.query.search || '';

  try {
    const baseWhere = {
      fromId: req.userId,
      asset: {
        uniqueNumber: { contains: search, mode: 'insensitive' },
      },
    };
    const total = await prisma.transferRecord.count({ where: baseWhere });
    if (!total) return res.status(404).json('No assets found');

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }
    const results = await prisma.transferRecord.findMany({
      where: baseWhere,
      include: { asset: true, from: true, to: true },
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No assets found');

    const totalPages = Math.ceil(total / pageSize);
    res.json({
      transferredAssets: results.map(r => ({
        ...r,
        asset: r.asset ? mapAssetForResponse(r.asset) : null,
      })),
      totalPages,
      currentPage: pageNumber,
      count: total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getRecievedAssets = async (req, res) => {
  let pageNumber = Number(req.query.pageNumber || 1);
  let pageSize = Number(req.query.pageSize || 10);
  const search = req.query.search || '';

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const ownerIdentifier = user?.phoneNumber || user?.email || '';
    const where = {
      OR: [{ notAnExistingUser: ownerIdentifier }, { toId: req.userId }],
      asset: {
        uniqueNumber: { contains: search, mode: 'insensitive' },
      },
    };
    const total = await prisma.transferRecord.count({ where });
    if (!total) return res.status(404).json('No assets found');

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }
    const results = await prisma.transferRecord.findMany({
      where,
      include: { asset: true, from: true, to: true },
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No assets found');

    const totalPages = Math.ceil(total / pageSize);
    res.json({
      recievedAssets: results.map(r => ({
        ...r,
        asset: r.asset ? mapAssetForResponse(r.asset) : null,
      })),
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
    const transferRecord = await prisma.transferRecord.findUnique({
      where: { id: req.params.id },
      include: {
        asset: true,
        to: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            ghanaCardNumber: true,
            image: true,
          },
        },
        from: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            ghanaCardNumber: true,
            image: true,
          },
        },
      },
    });
    if (!transferRecord) {
      return res.status(404).json('Transfer record not found');
    }
    res.status(200).json({
      ...transferRecord,
      asset: transferRecord.asset ? mapAssetForResponse(transferRecord.asset) : null,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const changeAssetStatus = async (req, res) => {
  try {
    const updatedAsset = await prisma.asset.updateMany({
      where: { id: req.params.id, ownerId: req.userId },
      data: { status: toDbStatus(req.body.status) },
    });
    if (updatedAsset.count) {
      const asset = await prisma.asset.findUnique({ where: { id: req.params.id } });
      res.status(200).json({ updatedAsset: mapAssetForResponse(asset) });
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

  try {
    const where = {
      ownerId: req.userId,
      OR: [
        { uniqueNumber: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ],
    };
    const total = await prisma.asset.count({ where });
    if (!total) return res.status(404).json('No assets found');

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }
    const results = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No assets found');

    const totalPages = Math.ceil(total / pageSize);
    res.json({
      assets: results.map(mapAssetForResponse),
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
    const assetToDelete = await prisma.asset.findFirst({
      where: { id: req.params.id, ownerId: req.userId },
    });

    if (!assetToDelete)
      return res
        .status(404)
        .json(
          'Failed to delete Asset, confirm if the user is the owner of the asset '
        );
    const deletedAsset = await prisma.asset.delete({
      where: { id: req.params.id },
    });
    if (deletedAsset) {
      return res.status(200).json({
        deletedAsset: mapAssetForResponse(deletedAsset),
        movedToDeleteCollection: {
          ...mapAssetForResponse(assetToDelete),
          deleted: new Date(),
        },
      });
    }
    return res.status(409).json('Failed to delete asset, please try again');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getSingleAssetUser = async (req, res) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: {
        uniqueNumber: req.params.id,
        ownerId: req.userId,
      },
      include: { owner: true },
    });
    if (!asset) res.status(404).json('Asset not found');
    res.status(200).json({ asset: mapAssetForResponse(asset) });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getSingleAsset = async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: { owner: true },
    });
    if (!asset) return res.status(404).json('Asset not found');
    res.status(200).json({ asset: mapAssetForResponse(asset) });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getAllAssets = async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ assets: assets.map(mapAssetForResponse) });
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
      await prisma.asset.create({
        data: {
          model: randomAsset.model,
          brand: randomAsset.brand,
          name: `${randomAsset.brand} ${randomAsset.model}`,
          type: randomAsset.type,
          uniqueNumber: randomAsset.uniqueNumber,
          dateOfPurchase: randomAsset.dateOfPurchase,
          price: randomAsset.price,
          purchaseReceipt: randomAsset.purchaseReciept,
          identificationDetails: randomAsset.identificationDetails,
          otherDetails: randomAsset.otherDetails,
          images: randomAsset.images,
          registrationAddress: randomAsset.registrationAddress,
          status: toDbStatus(randomAsset.status),
          ownerId: req.userId,
        },
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
  const pageSize = Number(req.query.pageSize || 0);
  const pageNumber = Number(req.query.pageNumber || 1);
  const skip = (pageNumber - 1) * pageSize;
  try {
    const where = {
      ...(owner ? { ownerId: owner } : {}),
      OR: [
        { model: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { uniqueNumber: { contains: search, mode: 'insensitive' } },
      ],
    };
    const total = await prisma.asset.count({ where });
    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(pageSize ? { take: pageSize, skip } : {}),
    });
    res.status(200).json({ assets: assets.map(mapAssetForResponse), pageNumber, total });
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
