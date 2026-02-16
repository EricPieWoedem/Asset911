import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { param, queryNum, queryStr } from '../../utils/request';

const mapAssetForResponse = (asset: { status?: string; purchaseReceipt?: string | null; [k: string]: unknown }) => ({
  ...asset,
  status: asset.status === 'for_sale' ? 'for sale' : asset.status,
  purchaseReciept: asset.purchaseReceipt,
});

const allowedPublicSearchFields = new Set(['uniqueNumber', 'name', 'brand', 'model', 'type', 'status']);

export const getAllPublicAssets = async (req: Request, res: Response) => {
  let pageSize = queryNum(req.query?.pageSize, 10);
  let pageNumber = queryNum(req.query?.pageNumber, 1);
  const searchField = queryStr(req.query?.searchField, 'uniqueNumber');
  const search = queryStr(req.query?.search, '');
  try {
    const normalizedSearchField = allowedPublicSearchFields.has(searchField) ? searchField : 'uniqueNumber';
    const where = { [normalizedSearchField]: { contains: search, mode: 'insensitive' as const } };
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
    res.status(200).json({
      assets: results.map(mapAssetForResponse),
      totalPages: Math.ceil(total / pageSize),
      total,
      currentPage: pageNumber,
    });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getPublicAssetById = async (req: Request, res: Response) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: param(req.params.id) },
      include: { owner: true },
    });
    if (!asset) return res.status(404).json('Asset not found');
    res.status(200).json(mapAssetForResponse(asset));
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getAssetsOfAllOnboardedInstittutions = async (req: Request, res: Response) => {
  let pageSize = queryNum(req.query?.pageSize, 10);
  let pageNumber = queryNum(req.query?.pageNumber, 1);
  const uniqueNumberSearch = queryStr(req.query?.uniqueNumberSearch, '');
  const institutionSearch = queryStr(req.query?.institutionSearch, '');
  const brandSearch = queryStr(req.query?.brandSearch, '');
  try {
    const where = {
      OR: [
        { uniqueNumber: { contains: uniqueNumberSearch, mode: 'insensitive' as const } },
        { ownerId: { contains: institutionSearch, mode: 'insensitive' as const } },
        { brand: { contains: brandSearch, mode: 'insensitive' as const } },
      ],
    };
    const total = await prisma.institutionAsset.count({ where });
    if (!total) return res.status(404).json('No assets found at count');
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
      assets: results.map(mapAssetForResponse),
      totalPages: Math.ceil(total / pageSize),
      total,
      currentPage: pageNumber,
      pageSize,
    });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};
