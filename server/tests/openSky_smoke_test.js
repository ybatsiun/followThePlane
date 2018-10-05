
//const expect = require('expect');
const expect = require('expect.js');
const { ObjectID } = require('mongodb');
const app = require('./../server');
const request = require('request');
const auth_helper = require('./helpers/authentication_helper.js');
const User = require('../models/user');
const PlainState = require('../models/planeStates');
const host = 'localhost:3000';

describe('Open sky network. Smoke', function () {
    this.timeout(30000);
    let firstIcaoAvailable, user;

    it('GET /authenticated/icaoList', (done) => {
        auth_helper.registerUser().then(registeredUser => {
            user = registeredUser;
            request({
                headers: {
                    'x-auth': user.token,
                },
                uri: `http://${host}/authenticated/icaoList`,
                method: 'GET'
            }, function (err, res, body) {
                expect(res.statusCode).to.be(200);
                //res.body is a string. transforming it to array
                const icaoNumbers = res.body.replace(/"|\[|\]/g, "").split(",");
                expect(icaoNumbers.length).to.be.above(0);
                firstIcaoAvailable = icaoNumbers[0];
                done();
            });
        }).catch((e) => done(e));
    });

    it('Add plane to myIcaoList', done => {
        request({
            headers: {
                'x-auth': user.token,
            },
            uri: `http://${host}/authenticated/addIcao/${firstIcaoAvailable}`,
            method: 'POST'
        }, function (err, res, body) {
            if (err) {
                done(e);
            }
            expect(res.statusCode).to.be(200);
            User.find({ username: user.username }).then(user => {
                expect(user[0].planes.length).to.be(1);
                const targetPlaneId = user[0].planes[0]._id.toHexString();
                PlainState.find({ planeID: targetPlaneId }).then(plainState => {
                    expect(plainState[0].trips.length).to.be(0);
                    done();
                });
            });
        });
    });
});
