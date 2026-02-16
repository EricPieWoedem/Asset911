const { Schema, model, default: mongoose } = require('mongoose');

const AssetSchema = new Schema(
  {
    model: {
      type: String,
    },
    brand: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
    categoryType: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    uniqueNumber: {
      type: String,
    },
    dateOfPurchase: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    purchaseReciept: {
      type: String,
      required: true,
    },
    identificationDetails: {
      type: String,
      required: true,
    },
    otherDetails: {
      type: String,
    },
    images: {
      type: Array,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    assignedTo: {
      type: Object,
      default: { staffName: '' },
    },
    registrationAddress: {
      type: String,
      required: true,
    },
    assetLocation: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['lost', 'sold', 'okay', 'damaged', 'for sale'],
      default: 'okay',
    },
    properties: {
      type: mongoose.Schema.Types.Mixed,
    },
    additionalCategoryData: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = model('InstitutionAsset', AssetSchema);
