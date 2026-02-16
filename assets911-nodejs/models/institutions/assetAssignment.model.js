const { Schema, model, default: mongoose } = require('mongoose');

const AssetAssignmentHistorySchema = new Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstitutionAsset',
    },
    staffId: {
      type: String,
      required: true,
    },
    staffName: {
      type: String,
      required: true,
    },
    assginedOn: {
      type: String,
      require: true,
    },
    unAssignedOn: {
      type: String,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
    },
  },
  { timestamps: true }
);

module.exports = model('AssetAssignmentHistory', AssetAssignmentHistorySchema);
