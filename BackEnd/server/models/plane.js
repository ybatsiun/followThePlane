const mongoose = require('mongoose');

const Plane = new mongoose.Schema({
    icao: String,
    originCountry: String
});

module.exports = Plane;
