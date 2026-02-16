const { Schema, model, default: mongoose } = require('mongoose');

const ReportSchema = new Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
    },
    notes: {
      type: string,
      required: true,
    },
    date: {
      type: date,
      required: true,
    },
    lastSeenLocation: {
      type: string,
      required: true,
    },
    report: {
      type: string,
      required: true,
    },
    status: {
      type: string,
      enum: ['found', 'not found'],
    },
  },
  { timestamps: true }
);

module.exports = model('Report', ReportSchema);
