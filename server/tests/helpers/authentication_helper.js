const User = require('../../models/user');
const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const app = require('../../server');



module.exports = {
    registerUser() {
        const newUser = {
            username: Math.random().toString(),
            password: 'qwerty'
        };

        return new Promise((resolve, reject) => {
            request(app)
                .post('/register')
                .send(newUser)
                .expect(200)
                .expect(res => {
                    expect(res.body.username)
                        .toBe(newUser.username, '/register didn\'t return just registered user username');
                })
                .end((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    User.find({ username: newUser.username }).then(dbUser => {
                        expect(dbUser[0].username).toBe(newUser.username);
                        expect(dbUser[0].tokens.length).toBe(1, 'Token array doesn\'t have length 1');
                        newUser.token = dbUser[0].tokens[0].token;
                        resolve(newUser);
                    }).catch(e => reject(e));
                });
        })
    }
}





