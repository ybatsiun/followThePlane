"use strict"
require('./config/config');
const UPDATE_INTERVAL = 0.5;//mins
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const http = require('http');
const User = require('./models/user');
const PlaneStates = require('./models/planeStates');
const { authenticate } = require('./middleware/authenticate');
const { getAllStates } = require('./middleware/skyNetworkApi/api');
const { getStateByIcao } = require('./middleware/skyNetworkApi/api');
const skyNetwork_service = require('./services/skyNetwork_service');
const _ = require('lodash');
const app = express();
const port = process.env.PORT;

app.options("/*", function (req, res, next) {
    setAccessHeaders(res);
    res.send(200);
});

app.use((req, res, next) => {
    setAccessHeaders(res);
    next();
});
const authRouter = express.Router();
authRouter.use(authenticate);

app.use(bodyParser.json());
app.use('/authenticated', authRouter);

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

//background process to update plains info
setInterval(() => {
    skyNetwork_service.fetchPlanesData();
}, UPDATE_INTERVAL * 60 * 1000);

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
    }).catch(e => {
        res.status(400).send(e);
    });
});

app.post('/register', (req, res) => {
    const body = _.pick(req.body, ['username', 'password']);
    var user = new User(body);
    User.isUserExist(body.username).then(isUserExist => {
        if (isUserExist) {
            res.status(400).send('User with such username already exists');
        } else {
            user.save().then(() => {
                return user.generateAuthToken();
            }).then(token => {
                res.header('x-auth', token).send(user);
            }).catch(e => {
                res.status(400).send(e);
            });
        };
    });
});
authRouter.get('/me', (req, res) => {
    res.send(req.user);
});

authRouter.delete('/logout', (req, res, next) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, (err) => {
        res.status(400).send(err);
    });
});

authRouter.get('/icaoList', getAllStates, (req, res, next) => {
    const parsedData = res.data.states;
    const availablePlanesList = parsedData.map(item => {
        return { icao: item[0], origin_country: item[2] }
    });
    res.send(availablePlanesList);
});
//can be added only from available planes
authRouter.post('/addIcao', async (req, res, next) => {
    const user = new User(req.user);
    const { icaoList } = _.pick(req.body, ['icaoList']);
    if (!icaoList) {
        res.status(400).send('icao list is empty')
    };

    const addIcaoPromises = [];

    for (const icao of icaoList) {

        const currentState = await skyNetwork_service.getStateByIcao(icao);
        if (!currentState) {
            addIcaoPromises.push(`${icao} was not added as it is not available anymore`);
        } else {
            addIcaoPromises.push(user.addIcaoObj(
                { icao, origin_country: currentState.origin_country }
            ));
        };

    };

    Promise.all(addIcaoPromises).then(messages => {
        res.status(200).send(messages)
    }).catch(err => {
        res.status(400).send(err)
    });

});
authRouter.get('/getMyIcaoList', async (req, res, next) => {

    User.getIcaoList(req.user.username).then(async planeIdList => {
        const list = [];

        for (const planeId of planeIdList) {
            const { originCountry, _id, icao, onGround } = await PlaneStates.findByDefaultId(planeId._id);
            list.push({ originCountry, _id, icao, onGround });
        };
        res.send(list);
    }).catch(e => {
        res.status(400).send(e.message);
    });
});
authRouter.delete('/deleteIcao/:planeId', async (req, res, next) => {
    const planeId = req.params.planeId;
    var user = new User(req.user);
    const planeToDelete = user.planes.find(element => element.id == planeId);
    if (planeToDelete) {
        try {
            await PlaneStates.deleteByPlaneId(planeId);
            await user.deletePlaneId(planeId);
            res.send({ message: `plain with id ${planeId} and it's travel history was removed from your list` });
        } catch (e) {
            res.status(400).send(e.message);
        };
    } else {
        res.status(400).send("Plane was not found in users plain list");
    };
})
//TODO merge two endpoints in one
//see the current plane info from users list
authRouter.get('/getCurrentPlaneStates', async (req, res, next) => {
    const planeIdArray = await User.getIcaoList(req.user.username);
    const planesCurrentData = [];
    for (let i = 0; i < planeIdArray.length; i++) {
        let planeData = {};
        const { icao } = await PlaneStates.findByDefaultId(planeIdArray[i]._id);
        const currentPlaneState = await PlaneStates.getCurrentStateByPlaneId(planeIdArray[i]._id);
        const tripsData = await PlaneStates.getTripsData(planeIdArray[i]._id);

        planeData = { icao, tripsData, currentPlaneState };
        planesCurrentData.push(planeData);
    }
    res.send({ planesCurrentData });
});

authRouter.get('/getCurrentPlaneStates/:id', async (req, res, next) => {
    const planeId = req.params.id;
    let planeData = {};
    const { icao } = await PlaneStates.findByDefaultId(planeId);
    const currentPlaneState = await PlaneStates.getCurrentStateByPlaneId(planeId);
    const tripsData = await PlaneStates.getTripsData(planeId);

    planeData = { icao, tripsData, currentPlaneState };
    res.send([planeData]);
});

authRouter.get('/getPlaneInfo/:planeId', async (req, res, next) => {
    PlaneStates.getTripsByPlaneId(req.params.planeId).then(planeObj => {
        res.send({ planeObj });
    });
});

function setAccessHeaders(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
}

module.exports = app;