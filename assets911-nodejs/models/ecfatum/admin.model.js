const { Schema, model, default: mongoose } = require('mongoose');

const AdminSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  institutionId: {
    type: String,
    default: 'ecfatum',
  },
  permissions: {
    type: Array,
    required: true,
  },
  refreshToken: {
    type: String,
  },
});

module.exports = model('EcfatumAdmin', AdminSchema);
