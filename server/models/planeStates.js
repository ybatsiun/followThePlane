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
    return this.update(
        { planeID: planeId },
        { $push: { planeData: [data] } }
    )
}

const PlaneStates = mongoose.model('PlaneStates', PlaneStatesSchema);
module.exports = PlaneStates;