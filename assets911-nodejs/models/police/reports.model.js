const { Schema, model, default: mongoose } = require('mongoose');

const ReportsSchema = new Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
  officerId: {
    type: String,
    required: true,
  },
  reportedBy: {
    type: String,
    required: true,
  },
});

module.exports = model('Reports', ReportsSchema);
