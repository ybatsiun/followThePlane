const MILISECONDS_IN_HOUR = 3600000;
const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const Trip = require('./trip.js');
const reverseGeoCodeService = require('../services/reverse_geo_coding_service');

const planeStatesSchema = new mongoose.Schema({
    currentTripIndex: { type: Number, default: 0 },
    icao: String,
    originCountry: String,
    onGround: { type: Boolean, default: false },
    trips: [Trip]
});

planeStatesSchema.statics.getCurrentTripIndexByPlaneId = function (planeId) {
    return this.findOne(planeId).then(plane => {
        return plane.currentTripIndex;
    });
}
planeStatesSchema.statics.getAllIds = function () {
    return this.find({}, { _id: 1 });

}
/**
 * @param {ObjectId|String} planeId
 */
planeStatesSchema.statics.findByDefaultId = function (planeId) {
    if (typeof planeId == "object") {
        return this.findOne(planeId);
    } else {
        return this.findOne({ _id: ObjectID(planeId) });
    }
}

planeStatesSchema.statics.deleteByPlaneId = function (planeID) {
    return this.deleteOne({ _id: ObjectID(planeID) });
}

planeStatesSchema.statics.getTripsByPlaneId = async function (planeID) {
    return this.findOne(planeID, { trips: 1 });
    //TODO isCurrent vs. isLastTrip
    //planeObj[currentTripIndex].isCurrent = true;
}

planeStatesSchema.statics.writeDataByPlaneId = async function (planeId, data) {
    const planeObj = await this.findByDefaultId(planeId);
    const { currentTripIndex } = planeObj;

    const isCurrentTripContainsData = planeObj.trips[currentTripIndex] !== undefined;
    // don't record it 
    if (!data) return

    // plane landed, current trip, that contains some data is ended 
    // and current trip index should be incremented on one 
    if (data.on_ground && await isCurrentTripContainsData) {
        const tripObj = await this.findOne({ planeId }, { trips: 1, _id: 0, currentTripIndex: 1 });
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
        q.onGround = true;

        return this.update(
            { planeId },
            { $set: q },
        );
    }
    // record every time the plane is not on the ground
    else if (!data.on_ground) {
        const currentTripKey = "trips." + currentTripIndex + ".tripData";
        const pushQuery = {};
        const setQuery = {};
        pushQuery[currentTripKey] = data;
        setQuery.onGround = false;
        await this.update(
            planeId,
            { $push: pushQuery },
            { $set: setQuery }
        );
        return this.calculateAvarageValues(planeId);
    }
}

planeStatesSchema.statics.calculateAvarageValues = async function (planeId) {
    const currentTripIndex = await this.getCurrentTripIndexByPlaneId(planeId);
    const plane = await this.findByDefaultId(planeId);

    const tripData = plane.trips[currentTripIndex].tripData;
    const firstSpotInTrip = tripData[0];
    const lastSpotInTrip = tripData.slice(-1)[0];
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
    query[currentTripKey + '.flightTime'] = msToTime(
        lastSpotInTrip.last_contact - firstSpotInTrip.last_contact);

    return this.update(
        planeId,
        { $set: query }
    );
}

planeStatesSchema.statics.getCurrentStateByPlaneId = async function (planeId) {
    const plane = await this.findByDefaultId(planeId._id || planeId);
    try {
        return plane.trips[plane.currentTripIndex].tripData.slice(-1);
    } catch (e) {
        return [{ message: 'The plain is on the ground' }];
    }
}

planeStatesSchema.statics.getTripsData = async function (planeId) {
    if (typeof planeId !== 'object') {
        planeId = ObjectID(planeId)
    };
    const tripObj = await this.find(planeId, { trips: 1 });
    //delete tripRecordData to minimize object sent to client;
    for (let i = 0; i < tripObj[0].trips.length; i++) {
        tripObj[0].trips[i].tripData = null;
    }
    return tripObj[0].trips;
}

function msToTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return hrs + ' hours ' + mins + ' min';
}

const planeStates = mongoose.model('planeStates', planeStatesSchema);
module.exports = planeStates;