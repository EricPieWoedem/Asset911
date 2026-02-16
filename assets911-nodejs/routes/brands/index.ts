import express from 'express';
import prisma from '../../config/prisma';
import {
  createCategory,
  createBrandAndModel,
  getCategories,
  getBrandsAndModels,
} from '../../controllers/assetType/assetType.controller';

const brands = express.Router();

brands.get('/', async (_req, res) => {
  try {
    const brandsList = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(brandsList);
  } catch {
    res.status(500).send('Internal Server error');
  }
});

brands.put('/:id', async (req, res) => {
  const { brands: brandsData, model } = req.body;
  try {
    const brand = await prisma.brand.findFirst({
      where: { type: req.params.id },
    });
    if (!brand) return res.status(404).send('Not found');
    const properties = (brand.properties as Record<string, string[]>) || {};
    if (Object.prototype.hasOwnProperty.call(properties, brandsData)) {
      properties[brandsData].push(model);
    } else {
      properties[brandsData] = [model];
    }
    const testResult = await prisma.brand.update({
      where: { id: brand.id },
      data: { properties },
    });
    if (testResult) res.status(200).json(testResult);
    else res.status(404).send('Not found');
  } catch {
    res.status(500).send('Internal Server error');
  }
});

brands.post('/add-category', createCategory);
brands.post('/add-brands-models', createBrandAndModel);
brands.get('/category', getCategories);
brands.get('/brandsAndModel', getBrandsAndModels);

export default brands;
