const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dateTimeSchema = new Schema({
    date: Number,
    month: Number,
    day: Number,
    registered: { type: Number, default: 0 },
    time: String,
    gridSize: { type: Number, default: 5 }
  });

const schedule = mongoose.model('gameSchedule', dateTimeSchema);
module.exports = schedule;
