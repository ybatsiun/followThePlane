const mongoose = require('mongoose');

const plainSchema = new mongoose.Schema({
    icao: String
});

module.exports = plainSchema;
