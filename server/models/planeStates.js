const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');

const PlaneStatesSchema = new mongoose.Schema({
    planeID: String,
    planeData: []
});
PlaneStatesSchema.statics.getAllIds = function () {
    return this.find({}, { planeID: 1 });

}
PlaneStatesSchema.statics.findByPlainId = function (planeId) {
    return this.findOne({ planeID: planeId }).then(plane => {
        return plane;
    });
}

PlaneStatesSchema.statics.writeDataByPlaneId = function (planeId, data) {
    const dafaultNames = ['icao24', 'callsign', 'origin_country', 'time_position', 'last_contact', 'longitude',
        'latitude', 'geo_altitude', 'on_ground', 'velocity', 'heading', 'vertical_rate', 'sensors', 'baro_altitude', 'squawk',
        'spi', 'position_source'];
    const singlePlaneData = {};
    for (let i = 0; i < data.length - 1; i++) {
        singlePlaneData[dafaultNames[i]] = data[i];
    };
    return this.update(
        { planeID: planeId },
        { $push: { planeData: [singlePlaneData] } }
    )
}

const PlaneStates = mongoose.model('PlaneStates', PlaneStatesSchema);
module.exports = PlaneStates;