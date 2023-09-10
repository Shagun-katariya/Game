const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  mobileNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v);
      },
      message: props => `${props.value} is not a valid mobile number!`
    },
  },
  booleanVariable: {
    type: Boolean,
    default: false
  },
  imageUrl: String,
  username: String,
  birthday: Date,
  grid: [[Number]]
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
