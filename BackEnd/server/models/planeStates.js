const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const Trip = require('./trip.js');
const reverseGeoCodeService = require('../services/reverse_geo_coding_service');

const DEFAULT_NAMES = ['icao24', 'callsign', 'origin_country', 'time_position', 'last_contact', 'longitude',
    'latitude', 'geo_altitude', 'on_ground', 'velocity', 'heading', 'vertical_rate', 'sensors', 'baro_altitude', 'squawk',
    'spi', 'position_source'];

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

    const singlePlaneData = {};
    for (let i = 0; i < DEFAULT_NAMES.length - 1; i++) {
        singlePlaneData[DEFAULT_NAMES[i]] = data[i];
    };
    const currentTripIndex = await this.getCurrentTripIndexByPlaneId(planeId);
    const isCurrentTripContainsData = () => {
        return this.findOne({ planeID: planeId }).then(plane => {
            return plane.trips[plane.currentTripIndex] !== undefined;
        });
    };

    // don't record it 
    if (singlePlaneData[0] == 'NO DATA') {
        return
    }

    // plane landed, current trip, that contains some data is ended 
    // and current trip index should be incremented on one 
    if (singlePlaneData[DEFAULT_NAMES[8]] && await isCurrentTripContainsData()) {
        const tripObj = await this.findOne({ planeID: planeId }, { trips: 1, _id: 0, currentTripIndex: 1 });
        const { currentTripIndex } = tripObj;
        const { trips } = tripObj;
        const firstSpotInTrip = trips[currentTripIndex].tripData[0];
        const lastSpotInTrip = trips[currentTripIndex].tripData.slice(-1)[0];

        const promises = [];
        promises.push(
            reverseGeoCodeService.getPlaceByGeoCoordinates(firstSpotInTrip.latitude, firstSpotInTrip.longitude));
        promises.push(
            reverseGeoCodeService.getPlaceByGeoCoordinates(lastSpotInTrip.latitude, lastSpotInTrip.longitude));
        const locations = await Promise.all(promises);

        const q = {};
        q[`trips.${currentTripIndex}.finishLocationObj`] = locations[0].results[0].locations;
        q[`trips.${currentTripIndex}.startLocationObj`] = locations[1].results[0].locations;
        q.currentTripIndex = currentTripIndex + 1;

        return this.update(
            { planeID: planeId },
            { $set: q },
        );
    }
    // record every time the plane is not on the ground
    else if (!singlePlaneData[DEFAULT_NAMES[8]]) {
        const currentTripKey = "trips." + currentTripIndex + ".tripData";
        const query = {};
        query[currentTripKey] = singlePlaneData;
        await this.update(
            { planeID: planeId },
            { $push: query }
        );
        return this.calculateAvarageValues(planeId);
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