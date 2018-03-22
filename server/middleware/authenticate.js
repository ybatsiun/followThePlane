var User = require('./../models/user');
var bcrypt = require('bcrypt');

var authenticate = (req, res, next) => {
const userID = req.header('sessionID');
    User.findByCredentials(req.body.username,req.body.password).then((user) => {
        if (!user) {
            return Promise.reject();
        };
        req.user = user;
        next();
    }).catch((e) => {
        res.status(401).send({ message: 'Unable to find user' });
    });
};

module.exports = {authenticate};