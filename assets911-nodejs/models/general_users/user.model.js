const { Schema, model, default: mongoose } = require('mongoose');

const UserSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['google', 'phoneNumber'],
      required: true,
    },
    phoneNumber: { type: String },
    ghanaCardNumber: { type: String },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);
