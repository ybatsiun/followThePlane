const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');

const planeStatesSchema = new mongoose.Schema({
    planeID: String,
    planeData: []
});
planeStatesSchema.statics.getAllIds = function () {
    return this.find({}, { planeID: 1 });

}
planeStatesSchema.statics.findByPlaneId = function (planeId) {
    return this.findOne({ planeID: planeId }).then(plane => {
        return plane;
    });
}
planeStatesSchema.statics.deleteByPlaneId = function(planeID){
    return this.deleteOne({planeID});
}

planeStatesSchema.statics.writeDataByPlaneId = function (planeId, data) {
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

const planeStates = mongoose.model('planeStates', planeStatesSchema);
module.exports = planeStates;