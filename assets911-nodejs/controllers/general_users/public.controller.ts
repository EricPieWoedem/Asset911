import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { param, queryNum, queryStr } from '../../utils/request';

const mapAssetForResponse = (asset: { status?: string; purchaseReceipt?: string; [k: string]: unknown }) => ({
  ...asset,
  status: asset.status === 'for_sale' ? 'for sale' : asset.status,
  purchaseReciept: asset.purchaseReceipt,
});

export const getAssetByUniqueNumber = async (req: Request, res: Response) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { uniqueNumber: param(req.params.uniqueNumber) },
      include: { owner: true },
    });
    if (!asset) return res.status(404).json('asset not found');
    res.status(200).json(mapAssetForResponse(asset));
  } catch {
    res.status(500).json('internal server error');
  }
};

export const getAssetsOnSale = async (req: Request, res: Response) => {
  let pageSize = queryNum(req.query?.pageSize, 10);
  let pageNumber = queryNum(req.query?.pageNumber, 1);
  const search = queryStr(req.query?.search, '');
  const category = queryStr(req.query?.category, '');
  const maxPrice = req.query?.maxPrice ? queryNum(req.query.maxPrice, 0) : null;
  const minPrice = req.query?.minPrice ? queryNum(req.query.minPrice, 0) : null;
  try {
    const where: Record<string, unknown> = {
      status: 'for_sale',
      OR: [
        { type: { contains: category, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ],
    };
    if (maxPrice !== null || minPrice !== null) {
      (where as Record<string, unknown>).price = {
        ...(minPrice !== null ? { gte: minPrice } : {}),
        ...(maxPrice !== null ? { lte: maxPrice } : {}),
      };
    }
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
      include: { owner: true },
    });
    if (!results.length) return res.status(404).json('No assets found ');
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
