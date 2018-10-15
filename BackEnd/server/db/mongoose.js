
const mongoose = require('mongoose');

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);
if (mongoose.connection.name.includes('test')) {
    mongoose.connection.dropDatabase();
};

module.exports = mongoose;