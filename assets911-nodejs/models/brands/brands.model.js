const { Schema, model } = require('mongoose');

const BrandSchema = new Schema(
  {
    type: { type: String, required: true },
    properties: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model('Brand', BrandSchema);
