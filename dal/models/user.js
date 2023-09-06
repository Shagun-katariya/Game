const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    accountId: {
      type: String,
    },
    name: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
    },
    googleId: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
