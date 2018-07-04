const mongoose = require('mongoose');

const Trip = new mongoose.Schema({
    //in future: some trip related values like avarages (speed,altitue etc.)
    tripData: []
});

module.exports = Trip;