
//const expect = require('expect');
const expect = require('expect.js');
const { ObjectID } = require('mongodb');
const app = require('./../server');
const request = require('request');
const auth_helper = require('./helpers/authentication_helper.js');

describe('Open sky network. Smoke', function () {
    this.timeout(10000);
    
    it('GET /authenticated/icaoList', (done) => {
        auth_helper.registerUser().then((user) => {
            request.get('http://localhost:3000/authenticated/icaoList', function (err, response, body) {
                request({
                    headers: {
                      'x-auth': user.token,
                    },
                    uri: 'http://localhost:3000/authenticated/icaoList',
                    method: 'GET'
                  }, function (err, res, body) {
                      expect(res.statusCode).to.be(200);
                      expect(res.body.length).to.be.above(0);
                    done();
                  });
            });
        }).catch((e) => done(e));
    });
});
