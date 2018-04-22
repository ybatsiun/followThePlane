const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');

const PlaneStatesSchema = new mongoose.Schema({
    planeID:String,
    planeData:[]
});
const PlaneStates = mongoose.model('PlaneStates', PlaneStatesSchema);
module.exports = PlaneStates;