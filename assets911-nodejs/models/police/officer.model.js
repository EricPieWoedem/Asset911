const { Schema, model } = require('mongoose');

const OfficerSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  institutionId: {
    type: Object,
    default: {
      id: 'police',
    },
  },
});

module.exports = model('Officer', OfficerSchema);
