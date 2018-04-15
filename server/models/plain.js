const mongoose = require('mongoose');

const Plain = new mongoose.Schema({
    icao: String
});

module.exports = Plain;
