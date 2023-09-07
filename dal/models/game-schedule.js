const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const GameSchema = new mongoose.Schema({
    date: Date,
    maxPlayers: Number,
    gridSize: Number, 
    registeredPlayers: [
        {
            email: String,
            grid: [[Number]],
        },
    ],
});

const Gameschema = mongoose.model('gameSchema', GameSchema);
module.exports = Gameschema;
