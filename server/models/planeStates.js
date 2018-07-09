const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const Trip = require('./trip.js');

const planeStatesSchema = new mongoose.Schema({
    planeID: String,
    currentTripIndex: { type: Number, default: 0 },
    trips: [Trip]
});

planeStatesSchema.statics.getCurrentTripIndexByPlaneId = function (planeId) {
    return this.findOne({ planeID: planeId }).then(plane => {
        return plane.currentTripIndex;
    });
}
planeStatesSchema.statics.getAllIds = function () {
    return this.find({}, { planeID: 1 });

}
planeStatesSchema.statics.findByPlaneId = function (planeId) {
    return this.findOne({ planeID: planeId }).then(plane => {
        return plane;
    });
}
planeStatesSchema.statics.deleteByPlaneId = function (planeID) {
    return this.deleteOne({ planeID });
}

planeStatesSchema.statics.writeDataByPlaneId = async function (planeId, data) {
    const dafaultNames = ['icao24', 'callsign', 'origin_country', 'time_position', 'last_contact', 'longitude',
        'latitude', 'geo_altitude', 'on_ground', 'velocity', 'heading', 'vertical_rate', 'sensors', 'baro_altitude', 'squawk',
        'spi', 'position_source'];
    const singlePlaneData = {};
    for (let i = 0; i < dafaultNames.length - 1; i++) {
        singlePlaneData[dafaultNames[i]] = data[i];
    };
    const currentTripIndex = await this.getCurrentTripIndexByPlaneId(planeId);
    const isCurrentTripContainsData = () => {
        return this.findOne({ planeID: planeId }).then(plane => {
            return plane.trips[plane.currentTripIndex] !== undefined;
        });
    };

    if (singlePlaneData[dafaultNames[0]] == 'NO DATA' && await isCurrentTripContainsData()) {
        return this.update(
            { planeID: planeId },
            { $set: { currentTripIndex: currentTripIndex + 1 } }
        );
    } else if (singlePlaneData[dafaultNames[0]] !== 'NO DATA') {
        const currentTripKey = "trips." + currentTripIndex + ".tripData";
        const query = {};
        query[currentTripKey] = singlePlaneData;
        return this.update(
            { planeID: planeId },
            { $push: query }
        )
    } else {
        //current trip is empty and current trip index doesn't have to be incremented
    }
}

planeStatesSchema.statics.getCurrentStateByPlaneId = async function (planeId) {
    const plane = await this.findOne({ planeID: planeId });
    try {
        return plane.trips[plane.currentTripIndex].tripData.slice(-1);
    } catch (e) {
        return 'The plain is on the ground';
    }
}

const planeStates = mongoose.model('planeStates', planeStatesSchema);
module.exports = planeStates;