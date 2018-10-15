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

planeStatesSchema.statics.getTripsByPlaneId = async function (planeID) {
    return this.findOne({ planeID });
    //TODO isCurrent vs. isLastTrip
    //planeObj[currentTripIndex].isCurrent = true;
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
        await this.update(
            { planeID: planeId },
            { $push: query }
        );
        return this.calculateAvarageValues(planeId);
    } else {
        //current trip is empty and current trip index doesn't have to be incremented
    }
}

planeStatesSchema.statics.calculateAvarageValues = async function (planeId) {
    const currentTripIndex = await this.getCurrentTripIndexByPlaneId(planeId);

    const tripDataQuery = await this.findOne({ planeID: planeId });
    const tripData = tripDataQuery.trips[currentTripIndex].tripData;
    const tripDataLength = tripData.length;
    const velocitySum = tripData.reduce((accumulator, currentValue) => {
        return accumulator + Number.parseFloat(currentValue.velocity || 0);
    }, 0);
    const geoAltitudeSum = tripData.reduce((accumulator, currentValue) => {
        return accumulator + Number.parseFloat(currentValue.geo_altitude || 0);
    }, 0);

    const query = {};
    const currentTripKey = "trips." + currentTripIndex;
    query[currentTripKey + '.avarageVelocity'] = velocitySum / tripDataLength;
    query[currentTripKey + '.avarageGeoAltitude'] = geoAltitudeSum / tripDataLength;

    return this.update(
        { planeID: planeId },
        { $set: query }
    );
}

planeStatesSchema.statics.getCurrentStateByPlaneId = async function (planeId) {
    const plane = await this.findOne({ planeID: planeId });
    try {
        return plane.trips[plane.currentTripIndex].tripData.slice(-1);
    } catch (e) {
        return [{ message: 'The plain is on the ground' }];
    }
}



const planeStates = mongoose.model('planeStates', planeStatesSchema);
module.exports = planeStates;