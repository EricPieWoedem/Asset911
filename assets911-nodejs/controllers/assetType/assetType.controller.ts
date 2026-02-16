import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { param } from '../../utils/request';

const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Unknown error');

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, categoryType } = req.body;
    const category = await prisma.category.create({ data: { name, categoryType } });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = param(req.params.id);
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Category not found' });
    const updatedDocument = await prisma.category.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};

export const createBrandAndModel = async (req: Request, res: Response) => {
  try {
    const { categoryType, brandsAndModels } = req.body;
    const category = await prisma.assetType.create({ data: { categoryType, brandsAndModels } });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};

export const updateBrandAndModel = async (req: Request, res: Response) => {
  const { brand, models } = req.body;
  try {
    const id = param(req.params.id);
    const documentToUpdate = await prisma.assetType.findUnique({ where: { id } });
    if (!documentToUpdate) return res.status(404).json({ message: 'Asset type not found' });
    const currentBrandsAndModels = documentToUpdate.brandsAndModels || {};
    if (Object.keys(currentBrandsAndModels as object).includes(brand)) {
      const currentModels = Array.isArray((currentBrandsAndModels as Record<string, string[]>)[brand])
        ? (currentBrandsAndModels as Record<string, string[]>)[brand]
        : [];
      const mergedModels = [...new Set([...currentModels, ...(models || [])])];
      const nextBrandsAndModels = { ...(currentBrandsAndModels as object), [brand]: mergedModels };
      const updatedDocument = await prisma.assetType.update({
        where: { id },
        data: { brandsAndModels: nextBrandsAndModels },
      });
      res.status(200).json(updatedDocument);
    } else res.status(200).json(documentToUpdate);
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};

export const getBrandsAndModels = async (req: Request, res: Response) => {
  try {
    const getBrandsAndModels = await prisma.assetType.findMany();
    const transformedData: Record<string, unknown> = {};
    getBrandsAndModels.forEach((data) => {
      transformedData[data.categoryType] = data.brandsAndModels;
    });
    res.status(200).json(transformedData);
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};
