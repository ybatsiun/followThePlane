const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const app = require('./../server');
const User = require('../models/user');


describe('Authentication Suite', function () {
    this.timeout(5000);
    it('Register a user', (done) => {
        const newUser = {
            username: Math.random().toString(),
            password: 'qwerty'
        };
        request(app)
            .post('/register')
            .send(newUser)
            .expect(200)
            .expect(res => {
                expect(res.body.username)
                    .toBe(newUser.username, '/register didn\'t return just registered user username');
            })
            .end((err, res) => {
                if (err) return done(err);
                User.find({ username: newUser.username }).then(dbUser => {
                    expect(dbUser[0].username).toBe(newUser.username);
                    expect(dbUser[0].tokens.length).toBe(1,'Token array doesn\'t have length 1');
                    done();
                }).catch((e) => done(e));
            });
    });
});