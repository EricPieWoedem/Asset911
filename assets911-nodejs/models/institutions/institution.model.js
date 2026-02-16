const { Schema, model, default: mongoose } = require('mongoose');

const institutionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = model('Institution', institutionSchema);
