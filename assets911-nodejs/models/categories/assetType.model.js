const { Schema, model } = require('mongoose');

const BrandAndsModels = new Schema(
  {
    categoryType: { type: String, required: true },
    brandsAndModels: { type: Object, required: true },
  },
  { timestamps: true }
);

BrandAndsModels.index({ unique: true });

module.exports = model('BrandAndsModels', BrandAndsModels);
