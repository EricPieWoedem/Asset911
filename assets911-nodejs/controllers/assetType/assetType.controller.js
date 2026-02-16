const prisma = require('../../config/prisma');

const createCategory = async (req, res) => {
  try {
    const { name, categoryType } = req.body;
    const category = await prisma.category.create({
      data: { name, categoryType },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Category not found' });
    const updatedDocument = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.status(200).json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBrandAndModel = async (req, res) => {
  try {
    const { categoryType, brandsAndModels } = req.body;
    const category = await prisma.assetType.create({
      data: {
        categoryType,
        brandsAndModels,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBrandAndModel = async (req, res) => {
  const { brand, models } = req.body;
  try {
    const documentToUpdate = await prisma.assetType.findUnique({
      where: { id: req.params.id },
    });
    if (!documentToUpdate) {
      return res.status(404).json({ message: 'Asset type not found' });
    }

    let updatedDocument;
    const currentBrandsAndModels = documentToUpdate.brandsAndModels || {};
    if (Object.keys(currentBrandsAndModels).includes(brand)) {
      const currentModels = Array.isArray(currentBrandsAndModels[brand])
        ? currentBrandsAndModels[brand]
        : [];
      const mergedModels = [...new Set([...currentModels, ...models])];
      const nextBrandsAndModels = {
        ...currentBrandsAndModels,
        [brand]: mergedModels,
      };
      updatedDocument = await prisma.assetType.update({
        where: { id: req.params.id },
        data: { brandsAndModels: nextBrandsAndModels },
      });
      res.status(200).json(updatedDocument);
    } else res.status(200).json(documentToUpdate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBrandsAndModels = async (req, res) => {
  try {
    const getBrandsAndModels = await prisma.assetType.findMany();
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
  updateBrandAndModel,
  createCategory,
  updateCategory,
  getCategories,
  getBrandsAndModels,
};
