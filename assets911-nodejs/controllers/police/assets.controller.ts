import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { param } from '../../utils/request';

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
