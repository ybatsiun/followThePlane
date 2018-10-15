const mongoose = require('mongoose');

const Plane = new mongoose.Schema({
    icao: String
});

module.exports = Plane;
