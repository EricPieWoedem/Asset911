const express = require('express');
const prisma = require('../../config/prisma');
const {
  createCategory,
  createBrandAndModel,
  getCategories,
  getBrandsAndModels,
} = require('../../controllers/assetType/assetType.controller');

const brands = express.Router();

brands.get('/', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).send('Internal Server error');
  }
});

brands.put('/:id', async (req, res) => {
  const { brands, model } = req.body;
  try {
    const brand = await prisma.brand.findFirst({
      where: { type: req.params.id },
    });
    if (!brand) return res.status(404).send('Not found');

    const properties = brand.properties || {};
    if (Object.prototype.hasOwnProperty.call(properties, brands)) {
      properties[brands].push(model);
    } else {
      properties[brands] = [model];
    }

    const testResult = await prisma.brand.update({
      where: { id: brand.id },
      data: { properties },
    });
    if (testResult) {
      res.status(200).json(testResult);
    } else res.status(404).send('Not found');
  } catch (error) {
    res.status(500).send('Internal Server error');
  }
});

brands.post('/add-category', createCategory);
brands.post('/add-brands-models', createBrandAndModel);
brands.get('/category', getCategories);
brands.get('/brandsAndModel', getBrandsAndModels);

module.exports = brands;
