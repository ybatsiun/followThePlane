const mongoose = require('mongoose');

const Trip = new mongoose.Schema({
    //in future: some trip related values like avarages (speed,altitue etc.)
    tripData: [],
    avarageVelocity: { type: Number },
    avarageGeoAltitude: { type: Number }
});

module.exports = Trip;