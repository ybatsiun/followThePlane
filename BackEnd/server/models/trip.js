const mongoose = require('mongoose');

const Trip = new mongoose.Schema({
    //in future: some trip related values like avarages (speed,altitue etc.)
    tripData: [],
    avarageVelocity: { type: Number },
    avarageGeoAltitude: { type: Number },
    finishLocationObj: { type: Object },
    startLocationObj: { type: Object },
    flightTime: String,
    isCurrent: {
        type: Boolean,
        default: true
    }
});

module.exports = Trip;