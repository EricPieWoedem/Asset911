const { Schema, model, default: mongoose } = require('mongoose');

const adminSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
  },
  password: {
    type: String,
    required: true,
  },
  permissions: {
    type: Array,
  },
  refreshToken: {
    type: String,
  },
});

module.exports = model('Admin', adminSchema);
