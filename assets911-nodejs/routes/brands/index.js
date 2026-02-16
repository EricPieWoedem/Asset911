const express = require('express');
const Brand = require('../../models/brands/brands.model');
const {
  createCategory,
  createBrandAndModel,
  getCategories,
  getBrandsAndModels,
} = require('../../controllers/assetType/assetType.controller');

const brands = express.Router();

brands.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({});
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).send('Internal Server error');
  }
});

brands.put('/:id', async (req, res) => {
  const { brands, model } = req.body;
  try {
    const brand = await Brand.findOne({ type: req.params.id });
    if (Object.keys(brand.properties).includes(brands)) {
      brand.properties[brands].push(model);
    } else {
      brand.properties[brands] = [model];
    }

    const testResult = await Brand.findOneAndUpdate(
      { type: req.params.id },
      { properties: brand.properties },
      { new: true }
    );
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
