"use strict"
require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const User = require('./models/user');
const { authenticate } = require('./middleware/authenticate');
const { getAllStates } = require('./middleware/skyNetworkApi/api');
const _ = require('lodash');
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());


app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

app.get('/', (req, res) => {
    res.send({
        welcomeMessage: "Hello!"
    });
});

app.post('/login', (req, res) => {
    const body = _.pick(req.body, ['username', 'password']);
    User.findByCredentials(body.username, body.password).then(user => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

app.post('/register', (req, res) => {
    const body = _.pick(req.body, ['username', 'password']);
    var user = new User(body);
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.delete('/logout', authenticate, (req, res, next) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.get('/needsAuth', authenticate, (req, res, next) => {
    res.send({
        message: `Welcome!.This page requires authentication!`
    });
});
app.get('/icaoList', getAllStates, (req, res, next) => {
    const parsedData = res.data.states;
    const icaoNumbersList = parsedData.reduce((accumulator, currentVal) => {
        accumulator.push(currentVal[0]);
        return accumulator;
    }, []);
    res.send(icaoNumbersList);
});

module.exports = app;