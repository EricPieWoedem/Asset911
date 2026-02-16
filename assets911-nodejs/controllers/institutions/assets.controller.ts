import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { param, queryNum, queryStr } from '../../utils/request';

type AuthReq = Request & { institutionId: string };

const toDbStatus = (status: string) => (status === 'for sale' ? 'for_sale' : status);
const fromDbStatus = (status: string) => (status === 'for_sale' ? 'for sale' : status);

const mapInstitutionAssetForResponse = (asset: { status?: string; purchaseReceipt?: string; [k: string]: unknown }) => ({
  ...asset,
  status: fromDbStatus(asset.status || ''),
  purchaseReciept: asset.purchaseReceipt,
});

export const createAsset = async (req: Request, res: Response) => {
  try {
    const institutionId = (req as AuthReq).institutionId;
    const existingAsset = await prisma.institutionAsset.findFirst({
      where: { uniqueNumber: req.body.uniqueNumber },
    });
    if (existingAsset) return res.status(400).json('Asset already exists');
    const asset = await prisma.institutionAsset.create({
      data: {
        model: req.body.model || null,
        brand: req.body.brand || null,
        type: req.body.type,
        categoryType: req.body.categoryType || null,
        name: `${req.body.brand} ${req.body.model}`,
        uniqueNumber: req.body.uniqueNumber || null,
        dateOfPurchase: req.body.dateOfPurchase || null,
        price: Number(req.body.price),
        purchaseReceipt: req.body.purchaseReceipt || req.body.purchaseReciept || '',
        identificationDetails: req.body.identificationDetails,
        otherDetails: req.body.otherDetails || null,
        images: req.body.images || [],
        ownerId: institutionId,
        registrationAddress: req.body.registrationAddress,
        assetLocation: req.body.assetLocation,
        status: (toDbStatus(req.body.status || 'okay') as import('@prisma/client').AssetStatus),
        properties: req.body.properties || undefined,
        additionalCategoryData: req.body.additionalCategoryData || undefined,
      },
    });
    if (!asset) return res.status(400).json('Failed to create asset');
    res.status(200).json(mapInstitutionAssetForResponse(asset));
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getAllInstitutionAssets = async (req: Request, res: Response) => {
  let pageSize = queryNum(req.query?.pageSize, 10);
  let pageNumber = queryNum(req.query?.pageNumber, 1);
  const search = queryStr(req.query?.search, '');
  try {
    const institutionId = (req as AuthReq).institutionId;
    const where = {
      ownerId: institutionId,
      OR: [
        { uniqueNumber: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ],
    };
    const total = await prisma.institutionAsset.count({ where });
    if (!total) return res.status(404).json('No assets found');
    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }
    const results = await prisma.institutionAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No assets found');
    res.status(200).json({
      assets: results.map(mapInstitutionAssetForResponse),
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
      total,
    });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const editAsset = async (req: Request, res: Response) => {
  try {
    const institutionId = (req as AuthReq).institutionId;
    const existing = await prisma.institutionAsset.findFirst({
      where: { id: param(req.params.id), ownerId: institutionId },
    });
    if (!existing) return res.status(400).json('Failed to update asset');
    const data: Record<string, unknown> = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(data, 'status')) {
      data.status = toDbStatus(data.status as string);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'purchaseReciept')) {
      data.purchaseReceipt = data.purchaseReciept;
      delete data.purchaseReciept;
    }
    await prisma.institutionAsset.update({ where: { id: param(req.params.id) }, data });
    res.status(201).json('Updated Asset Successfully');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const assignAsset = async (req: Request, res: Response) => {
  const { staffId, staffName } = req.body;
  try {
    const institutionId = (req as AuthReq).institutionId;
    const assetToAssign = await prisma.institutionAsset.findFirst({
      where: { id: param(req.params.id), ownerId: institutionId },
    });
    if (!assetToAssign) return res.status(404).json('No asset found');
    const checkifAssetIsAlreadyAssigned = (assetToAssign.assignedTo as Record<string, string> | null) || {};
    if (Object.keys(checkifAssetIsAlreadyAssigned).length > 1) {
      return res.status(400).json(`Asset is already assigned to ${checkifAssetIsAlreadyAssigned.staff}`);
    }
    const history = await prisma.assetAssignmentHistory.create({
      data: {
        assetId: assetToAssign.id,
        staffId,
        staffName,
        assginedOn: new Date().toISOString(),
        institutionId,
      },
    });
    await prisma.institutionAsset.update({
      where: { id: assetToAssign.id },
      data: {
        assignedTo: {
          staff: `${staffName} (${staffId})`,
          assignmentId: history.id,
        },
      },
    });
    res.status(200).json('Asset Assigned Successfully');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const unAssignAsset = async (req: Request, res: Response) => {
  try {
    const institutionId = (req as AuthReq).institutionId;
    const assetToMakeAvailable = await prisma.institutionAsset.findFirst({
      where: { id: param(req.params.id), ownerId: institutionId },
    });
    if (!assetToMakeAvailable) return res.status(404).json('No asset found');
    const assignedTo = assetToMakeAvailable.assignedTo as { assignmentId?: string } | null;
    const assignmentId = assignedTo?.assignmentId;
    if (!assignmentId) return res.status(404).json('No assignment history found');
    const history = await prisma.assetAssignmentHistory.findUnique({ where: { id: assignmentId } });
    if (!history) return res.status(404).json('No assignment history found');
    await prisma.assetAssignmentHistory.update({
      where: { id: history.id },
      data: { unAssignedOn: new Date().toISOString() },
    });
    await prisma.institutionAsset.update({
      where: { id: assetToMakeAvailable.id },
      data: { assignedTo: { staffName: '' } },
    });
    res.status(200).json('Asset Unassigned Successfully');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getAssetAssignmentHistory = async (req: Request, res: Response) => {
  let pageSize = queryNum(req.query?.pageSize, 10);
  let pageNumber = queryNum(req.query?.pageNumber, 1);
  const search = queryStr(req.query?.search, '');
  try {
    const institutionId = (req as AuthReq).institutionId;
    const where = {
      institutionId,
      OR: [
        { staffId: { contains: search, mode: 'insensitive' as const } },
        { staffName: { contains: search, mode: 'insensitive' as const } },
      ],
    };
    const total = await prisma.assetAssignmentHistory.count({ where });
    if (!total) return res.status(404).json('No history found');
    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }
    const results = await prisma.assetAssignmentHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No history found');
    res.status(200).json({
      results,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
      total,
    });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getSingleAsset = async (req: Request, res: Response) => {
  try {
    const institutionId = (req as AuthReq).institutionId;
    const asset = await prisma.institutionAsset.findUnique({ where: { id: param(req.params.id) } });
    if (!asset) return res.status(404).json('No asset found');
    if (institutionId === asset.ownerId) {
      res.status(200).json(mapInstitutionAssetForResponse(asset));
    } else {
      res.status(401).json('Unauthorized');
    }
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getBrands = async (req: Request, res: Response) => {
  try {
    const institutionId = (req as AuthReq).institutionId;
    const assets = await prisma.institutionAsset.findMany({
      where: { ownerId: institutionId },
      select: { brand: true, model: true },
    });
    const grouped: Record<string, string[]> = {};
    assets.forEach((asset) => {
      if (!asset.brand) return;
      if (!grouped[asset.brand]) grouped[asset.brand] = [];
      if (asset.model && !grouped[asset.brand].includes(asset.model)) {
        grouped[asset.brand].push(asset.model);
      }
    });
    res.status(200).json(grouped);
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getSelectedAssetsAssignmentHistory = async (req: Request, res: Response) => {
  let pageSize = queryNum(req.query?.pageSize, 10);
  let pageNumber = queryNum(req.query?.pageNumber, 1);
  const search = queryStr(req.query?.search, '');
  try {
    const institutionId = (req as AuthReq).institutionId;
    const where = {
      institutionId,
      assetId: param(req.params.id),
      OR: [
        { staffId: { contains: search, mode: 'insensitive' as const } },
        { staffName: { contains: search, mode: 'insensitive' as const } },
      ],
    };
    const total = await prisma.assetAssignmentHistory.count({ where });
    if (!total) return res.status(404).json('No history found');
    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }
    const results = await prisma.assetAssignmentHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No history found');
    res.status(200).json({
      results,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
      total,
    });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const institutionId = (req as AuthReq).institutionId;
    const totalAssetCount = await prisma.institutionAsset.count({
      where: { ownerId: institutionId },
    });
    const totalUnassignedAssetCount = await prisma.institutionAsset.count({
      where: {
        ownerId: institutionId,
        assignedTo: { path: ['staffName'], equals: '' },
      },
    });
    const totalAssigned = totalAssetCount - totalUnassignedAssetCount;
    res.status(200).json({ totalAssetCount, totalUnassignedAssetCount, totalAssigned });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};
