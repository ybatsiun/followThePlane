"use strict"
require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const http = require('http');
const User = require('./models/user');
const PlaneStates = require('./models/planeStates');
const { authenticate } = require('./middleware/authenticate');
const { getAllStates } = require('./middleware/skyNetworkApi/api');
const { getStateByIcao } = require('./middleware/skyNetworkApi/api');
const dateFormat = require('dateformat');
const _ = require('lodash');
const os = require('os');
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use('/authenticated', authenticate);

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});
setInterval(() => {
    const url = `http://localhost:3000/getPlanesStates`;
    http.get(url);
}, 60 * 1000);

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

app.get('/authenticated/me', (req, res) => {
    res.send(req.user);
});

app.delete('/authenticated/logout', (req, res, next) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.get('/authenticated/needsAuth', (req, res, next) => {
    res.send({
        message: `Welcome!.This page requires authentication!`
    });
});
app.get('/authenticated/icaoList', getAllStates, (req, res, next) => {
    const parsedData = res.data.states;
    const icaoNumbersList = parsedData.reduce((accumulator, currentVal) => {
        accumulator.push(currentVal[0]);
        return accumulator;
    }, []);
    res.send(icaoNumbersList);
});
app.get('/getState/:icao', getStateByIcao, (req, res, next) => {
    const parsedData = res.data.states;
    res.send({
        state: parsedData
    });
});
app.post('/authenticated/addIcao/:icao', (req, res, next) => {
    const icao = req.params.icao;
    var user = new User(req.user);
    user.addIcaoNumber(icao).then(icaoDocumentID => {
        const planeStates = new PlaneStates({ planeID: icaoDocumentID });
        planeStates.save().then(() => {
            res.send({ message: `${icao} was successfully added to your profile.` });
        }).catch(e => {
            res.status(400).send(e);
        });
    }).catch(e => {
        res.status(400).send(e);
    });
});
app.get('/authenticated/getMyIcaoList', (req, res, next) => {
    User.getIcaoList(req.user.username).then((icaoList) => {
        const icaoList_formatted = [];
        for (const planeObj of icaoList.planes) {
            icaoList_formatted.push(planeObj.icao);
        }
        res.send({ message: `Here is your Icao list ${icaoList_formatted}` });
    }).catch(e => {
        res.status(400).send(e);
    });
});

app.get('/getPlanesStates', async (req, res, next) => {
    const planeStateList = await PlaneStates.getAllIds();

    for (const planeState of planeStateList) {
        const icao = await User.getIcaoByPlaneID(planeState.planeID);
        const url = `http://localhost:3000/getState/${icao}`;
        http.get(url, res => {
            res.setEncoding('utf8');
            let rawData = '';
            let planeStatesData;
            res.on('data', chunk => { rawData += chunk; });
            res.on('end', async () => {
                try {
                    planeStatesData = JSON.parse(rawData);
                    console.log('writing data for ' + icao + ' at ' + dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss"));
                    await PlaneStates.writeDataByPlaneId(planeState.planeID, planeStatesData.state[0]);
                } catch (e) {
                    console.error(e.message);
                    res.status(400).send(e);
                }
            });
        });
    };
    //promisify every iteration => map => and promise .all => send 200
    res.status(200).send();
});

module.exports = app;