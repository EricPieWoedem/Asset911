const { Schema, model, default: mongoose } = require('mongoose');

const AssetSchema = new Schema(
  {
    model: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
    },
    categoryType: {
      type: String,
    },
    uniqueNumber: {
      type: String,
      required: true,
    },
    dateOfPurchase: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    purchaseReciept: {
      type: String,
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
    registrationAddress: {
      type: String,
      required: true,
    },
    presentLocation: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recentTransferRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransferRecord',
    },
    status: {
      type: String,
      enum: ['lost', 'sold', 'okay', 'damaged', 'for sale'],
      required: true,
    },
    additionalCategoryData: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = model('Asset', AssetSchema);
