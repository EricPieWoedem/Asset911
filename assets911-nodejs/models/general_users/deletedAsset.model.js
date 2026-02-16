const { Schema, model, default: mongoose } = require('mongoose');

const DeletedAssetSchema = new Schema(
  {
    model: {
      type: String,
    },
    brand: {
      type: String,
    },
    type: {
      type: String,
    },
    uniqueNumber: {
      type: String,
    },
    dateOfPurchase: {
      type: String,
    },
    price: {
      type: Number,
    },
    purchaseReciept: {
      type: String,
    },
    identificationDetails: {
      type: String,
    },
    otherDetails: {
      type: String,
    },
    images: {
      type: Array,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    previousOwners: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      enum: ['lost', 'sold', 'okay', 'damaged', 'for sale'],
    },
    deleted: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = model('DeletedAsset', DeletedAssetSchema);
