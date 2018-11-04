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

planeStatesSchema.statics.findByDefaultId = function (planeID) {
    return this.findOne(planeID);
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
    if (data.on_ground && await isCurrentTripContainsData()) {
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
        const query = {};
        query[currentTripKey] = data;
        query.onGround = false;
        await this.update(
            planeId,
            { $push: query }
        );
        return this.calculateAvarageValues(planeId);
    }
}

planeStatesSchema.statics.calculateAvarageValues = async function (planeId) {
    const currentTripIndex = await this.getCurrentTripIndexByPlaneId(planeId);
    const tripDataQuery = await this.findByDefaultId(planeId);
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
        planeId,
        { $set: query }
    );
}

planeStatesSchema.statics.getCurrentStateByPlaneId = async function (planeId) {
    const plane = await this.findOne(planeId._id);
    try {
        return plane.trips[plane.currentTripIndex].tripData.slice(-1);
    } catch (e) {
        return [{ message: 'The plain is on the ground' }];
    }
}

const planeStates = mongoose.model('planeStates', planeStatesSchema);
module.exports = planeStates;