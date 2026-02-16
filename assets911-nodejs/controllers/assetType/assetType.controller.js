const BrandAndsModels = require('../../models/categories/assetType.model');
const Category = require('../../models/categories/category.model');

const createCategory = async (req, res) => {
  try {
    const { name, categoryType } = req.body;
    const category = await Category.create({ name, categoryType });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const updatedDocument = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBrandAndModel = async (req, res) => {
  try {
    const { categoryType, brandsAndModels } = req.body;
    const category = await BrandAndsModels.create({
      categoryType,
      brandsAndModels,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBrandAndModel = async (req, res) => {
  const { brand, models } = req.body;
  try {
    const documentToUpdate = await BrandAndsModels.findById(req.params.id);
    let updatedDocument;
    if (Object.keys(documentToUpdate.brandsAndModels).includes(brand)) {
      updatedDocument = await BrandAndsModels.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { brandsAndModels: models } },
        { new: true }
      );
      res.status(200).json(updatedDocument);
    } else res.status(200).json(documentToUpdate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBrandsAndModels = async (req, res) => {
  try {
    const getBrandsAndModels = await BrandAndsModels.find();
    const transformedData = {};
    getBrandsAndModels.map(data => {
      transformedData[data.categoryType] = data.brandsAndModels;
    });
    res.status(200).json(transformedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBrandAndModel,
  createCategory,
  updateCategory,
  getCategories,
  getBrandsAndModels,
};
