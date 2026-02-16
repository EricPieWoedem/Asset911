const { Schema, model } = require('mongoose');

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    categoryType: { type: Array, required: true },
  },
  { timestamps: true }
);

CategorySchema.index({ unique: true });

module.exports = model('Category', CategorySchema);
