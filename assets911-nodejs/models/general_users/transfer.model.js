const { Schema, model, default: mongoose } = require('mongoose');

const TransferRecord = new Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    transferDate: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    confirmationCode: {
      type: String,
    },
    notAnExistingUser: {
      type: String,
    },
    status: {
      type: String,
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = model('TransferRecord', TransferRecord);
