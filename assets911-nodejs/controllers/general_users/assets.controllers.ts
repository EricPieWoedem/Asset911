import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { generateOTP, createTransferToken, verifyTransferToken } from '../../config/otp';
import { sendSMS } from '../../utils/sms';
import { sendEmail } from '../../utils/email';
import { param, queryNum, queryStr } from '../../utils/request';

type AuthReq = Request & { userId: string };

const ghanaPhoneNumberRegex = /^(?:(?:\+|00)233|0)([23456]\d{8}|[2359]([35]3|[49]9)\d{7})$/;

const toDbStatus = (status: string) => (status === 'for sale' ? 'for_sale' : status);
const fromDbStatus = (status: string) => (status === 'for_sale' ? 'for sale' : status);

const mapAssetForResponse = (asset: { status?: string; purchaseReceipt?: string; [k: string]: unknown }) => ({
  ...asset,
  status: fromDbStatus(asset.status || ''),
  purchaseReciept: asset.purchaseReceipt,
});

export const addAsset = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).userId;
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
        ownerId: userId,
      },
    });
    const userDetails = await prisma.user.findUnique({ where: { id: userId } });
    const message = `Your asset ${newAsset.name} with unique number ${newAsset.uniqueNumber} has been added to your portfolio.`;
    if (userDetails?.phoneNumber) {
      await sendSMS(userDetails.phoneNumber, message);
      if (userDetails.email) await sendEmail(userDetails.email, 'New Asset', message);
    } else if (userDetails?.email) {
      await sendEmail(userDetails.email, 'New Asset', message);
    }
    return res.status(200).json('Asset Created');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).userId;
    const existing = await prisma.asset.findFirst({
      where: { id: param(req.params.id), ownerId: userId },
    });
    if (!existing) {
      return res.status(400).json('Failed to update asset, confirm if user is the owner of the asset');
    }
    const data: Record<string, unknown> = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(data, 'status')) {
      data.status = toDbStatus(data.status as string);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'purchaseReciept')) {
      data.purchaseReceipt = data.purchaseReciept;
      delete data.purchaseReciept;
    }
    await prisma.asset.update({ where: { id: param(req.params.id) }, data });
    res.status(200).json('Asset Updated');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const transferAsset = async (req: Request, res: Response) => {
  const { newOwner, notes, transferDate } = req.body;
  const otp = generateOTP(4);
  const otpToken = createTransferToken(otp);
  try {
    const userId = (req as AuthReq).userId;
    const asset = await prisma.asset.findFirst({
      where: { id: param(req.params.id), ownerId: userId },
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
          assetId: param(req.params.id),
          fromId: userId,
          notAnExistingUser: newOwner,
          confirmationCode: otpToken,
          notes,
          transferDate,
        },
      });
    } else {
      transferRecord = await prisma.transferRecord.create({
        data: {
          assetId: param(req.params.id),
          fromId: userId,
          toId: existingUser.id,
          confirmationCode: otpToken,
          notes,
          transferDate,
        },
      });
    }
    if (!transferRecord) return res.status(400).json('Failed to transfer asset');
    await prisma.asset.update({
      where: { id: param(req.params.id) },
      data: { recentTransferRecordId: transferRecord.id },
    });
    const presentOwner = await prisma.user.findUnique({ where: { id: userId } });
    const message = `Please give the following code ${otp} to the new owner of your ${asset.brand} ${asset.model} with serial no. ${asset.uniqueNumber}`;
    if (presentOwner?.phoneNumber) {
      await sendSMS(presentOwner.phoneNumber, message);
      if (presentOwner.email) await sendEmail(presentOwner.email, 'Asset Transfer', message);
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
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const cancelAssetTransfer = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).userId;
    const transferToCancel = await prisma.transferRecord.findUnique({ where: { id: param(req.params.id) } });
    if (!transferToCancel) return res.status(404).json('Transfer record not found');
    if (transferToCancel.fromId !== userId) return res.status(401).json('Unauthorized');
    await prisma.transferRecord.update({
      where: { id: transferToCancel.id },
      data: { status: 'cancelled' },
    });
    return res.status(200).json('Transfer cancelled');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const confirmTransfer = async (req: Request, res: Response) => {
  const { code } = req.body;
  const assetId = param(req.params.id);
  try {
    const userId = (req as AuthReq).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json('Asset not found');
    const transferRecord = await prisma.transferRecord.findFirst({
      where: { assetId, id: asset.recentTransferRecordId ?? undefined },
    });
    if (!transferRecord) return res.status(404).json('Transfer record not found');
    if (userId !== transferRecord.toId && user?.phoneNumber !== transferRecord.notAnExistingUser) {
      return res.status(401).json('Unauthorized');
    }
    if (!transferRecord.confirmationCode || code !== verifyTransferToken(transferRecord.confirmationCode)) {
      return res.status(400).json('Incorrect code');
    }
    await prisma.asset.update({ where: { id: asset.id }, data: { ownerId: userId } });
    await prisma.transferRecord.update({
      where: { id: transferRecord.id },
      data: { toId: userId, status: 'confirmed' },
    });
    return res.status(200).json('Asset transferred');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const resendTransferConfirmationCode = async (req: Request, res: Response) => {
  const otp = generateOTP(4);
  const otpToken = createTransferToken(otp);
  try {
    const userId = (req as AuthReq).userId;
    const transferRecord = await prisma.transferRecord.findUnique({ where: { id: param(req.params.id) } });
    if (!transferRecord) return res.status(404).json('Transfer record not found');
    if (transferRecord.fromId !== userId) return res.status(401).json('Unauthorized');
    await prisma.transferRecord.update({
      where: { id: transferRecord.id },
      data: { confirmationCode: otpToken },
    });
    const presentOwner = await prisma.user.findUnique({ where: { id: userId } });
    const message = `Your new transfer confirmation code is ${otp}`;
    if (presentOwner?.phoneNumber) {
      await sendSMS(presentOwner.phoneNumber, message);
      if (presentOwner.email) await sendEmail(presentOwner.email, 'Asset Transfer', message);
    } else if (presentOwner?.email) {
      await sendEmail(presentOwner.email, 'Asset Transfer', message);
    }
    res.status(200).json('Otp sent');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getTransferredAssets = async (req: Request, res: Response) => {
  let pageNumber = queryNum(req.query.pageNumber, 1);
  let pageSize = queryNum(req.query.pageSize, 10);
  const search = queryStr(req.query.search, '');
  try {
    const userId = (req as AuthReq).userId;
    const baseWhere = {
      fromId: userId,
      asset: { uniqueNumber: { contains: search, mode: 'insensitive' as const } },
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
    res.json({
      transferredAssets: results.map((r) => ({
        ...r,
        asset: r.asset ? mapAssetForResponse(r.asset) : null,
      })),
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
      count: total,
    });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getRecievedAssets = async (req: Request, res: Response) => {
  let pageNumber = queryNum(req.query.pageNumber, 1);
  let pageSize = queryNum(req.query.pageSize, 10);
  const search = queryStr(req.query.search, '');
  try {
    const userId = (req as AuthReq).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const ownerIdentifier = (user?.phoneNumber || user?.email || '') as string;
    const where = {
      OR: [{ notAnExistingUser: ownerIdentifier }, { toId: userId }],
      asset: { uniqueNumber: { contains: search, mode: 'insensitive' as const } },
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
    res.json({
      recievedAssets: results.map((r) => ({
        ...r,
        asset: r.asset ? mapAssetForResponse(r.asset) : null,
      })),
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
      count: total,
    });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getSingleTransferRecord = async (req: Request, res: Response) => {
  try {
    const transferRecord = await prisma.transferRecord.findUnique({
      where: { id: param(req.params.id) },
      include: {
        asset: true,
        to: { select: { id: true, name: true, email: true, phoneNumber: true, ghanaCardNumber: true, image: true } },
        from: { select: { id: true, name: true, email: true, phoneNumber: true, ghanaCardNumber: true, image: true } },
      },
    });
    if (!transferRecord) return res.status(404).json('Transfer record not found');
    res.status(200).json({
      ...transferRecord,
      asset: transferRecord.asset ? mapAssetForResponse(transferRecord.asset) : null,
    });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const changeAssetStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).userId;
    const updatedAsset = await prisma.asset.updateMany({
      where: { id: param(req.params.id), ownerId: userId },
      data: { status: toDbStatus(req.body.status) as import('@prisma/client').AssetStatus },
    });
    if (updatedAsset.count) {
      const asset = await prisma.asset.findUnique({ where: { id: param(req.params.id) } });
      res.status(200).json({ updatedAsset: asset ? mapAssetForResponse(asset) : null });
    } else {
      res.status(400).json('Failed to update asset,confirm if the user is the owner of the asset');
    }
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getAllUserAssets = async (req: Request, res: Response) => {
  let pageSize = queryNum(req.query?.pageSize, 10);
  let pageNumber = queryNum(req.query?.pageNumber, 1);
  const search = queryStr(req.query?.search, '');
  try {
    const userId = (req as AuthReq).userId;
    const where = {
      ownerId: userId,
      OR: [
        { uniqueNumber: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
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
    res.json({
      assets: results.map(mapAssetForResponse),
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
      count: total,
    });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).userId;
    const assetToDelete = await prisma.asset.findFirst({
      where: { id: param(req.params.id), ownerId: userId },
    });
    if (!assetToDelete) {
      return res.status(404).json('Failed to delete Asset, confirm if the user is the owner of the asset ');
    }
    const deletedAsset = await prisma.asset.delete({ where: { id: param(req.params.id) } });
    if (deletedAsset) {
      return res.status(200).json({
        deletedAsset: mapAssetForResponse(deletedAsset),
        movedToDeleteCollection: { ...mapAssetForResponse(assetToDelete), deleted: new Date() },
      });
    }
    return res.status(409).json('Failed to delete asset, please try again');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getSingleAssetUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).userId;
    const asset = await prisma.asset.findFirst({
      where: { uniqueNumber: param(req.params.id), ownerId: userId },
      include: { owner: true },
    });
    if (!asset) return res.status(404).json('Asset not found');
    res.status(200).json({ asset: mapAssetForResponse(asset) });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getSingleAsset = async (req: Request, res: Response) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: param(req.params.id) },
      include: { owner: true },
    });
    if (!asset) return res.status(404).json('Asset not found');
    res.status(200).json({ asset: mapAssetForResponse(asset) });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getAllAssets = async (req: Request, res: Response) => {
  try {
    const assets = await prisma.asset.findMany({
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ assets: assets.map(mapAssetForResponse) });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const generateDummyData = async (req: Request, res: Response) => {
  const getRandomAsset = () => {
    const assetTypes = ['Car', 'Phone', 'Laptop', 'Tablet', 'Watch', 'Headphones', 'Camera'];
    const getRandomType = () => assetTypes[Math.floor(Math.random() * assetTypes.length)];
    const getRandomString = (length = 5) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
      return result;
    };
    const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
    const getRandomDate = () => {
      const start = new Date(2000, 0, 1).getTime();
      const end = Date.now();
      return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0];
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
      images: ['https://res.cloudinary.com/jhay/image/upload/v1699013243/br7lywtwczk0436y7uae.png'],
      registrationAddress: getRandomString(),
      status: ['lost', 'sold', 'okay', 'damaged', 'for sale'][getRandomNumber(0, 4)],
    };
  };
  try {
    const userId = (req as AuthReq).userId;
    const length = Array.isArray(req.body) ? req.body.length : 0;
    for (let i = 0; i < length; i++) {
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
          status: toDbStatus(randomAsset.status) as import('@prisma/client').AssetStatus,
          ownerId: userId,
        },
      });
      if (i === length - 1) return res.status(201).json('Data generated successfully');
    }
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getAssets = async (req: Request, res: Response) => {
  const search = queryStr(req.query.search, '');
  const owner = queryStr(req.query.owner, '');
  const pageSize = queryNum(req.query.pageSize, 0);
  const pageNumber = queryNum(req.query.pageNumber, 1);
  const skip = (pageNumber - 1) * pageSize;
  try {
    const where: { ownerId?: string; OR?: object[] } = {
      ...(owner ? { ownerId: owner } : {}),
      OR: [
        { model: { contains: search, mode: 'insensitive' as const } },
        { brand: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
        { uniqueNumber: { contains: search, mode: 'insensitive' as const } },
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
