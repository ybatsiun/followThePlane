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
const skyNetwork_helper = require('./helpers/skyNetwork_helper');
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
const updateInterval = 5;//mins
setInterval(() => {
    skyNetwork_helper.fetchPlanesData();
}, updateInterval * 60 * 1000);




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
//TODO return only safe info
authRouter.get('/me', (req, res) => {
    res.send(req.user);
});

authRouter.delete('/logout', (req, res, next) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

authRouter.get('/icaoList', getAllStates, (req, res, next) => {
    const parsedData = res.data.states;
    const icaoNumbersList = parsedData.reduce((accumulator, currentVal) => {
        accumulator.push(currentVal[0]);
        return accumulator;
    }, []);
    res.send(icaoNumbersList);
});
authRouter.post('/addIcao/:icao', (req, res, next) => {
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
authRouter.get('/getMyIcaoList', (req, res, next) => {
    User.getIcaoList(req.user.username).then(icaoList => {
        const icaoListFormatted = [];
        for (const icaoObj of icaoList) {
            icaoListFormatted.push(icaoObj.icao);
        };
        res.send({ message: `Here is your Icao list ${icaoListFormatted}` });
    }).catch(e => {
        res.status(400).send(e.message);
    });
});
authRouter.delete('/deleteIcao/:icao', async (req, res, next) => {
    const icaoToDelete = req.params.icao;
    var user = new User(req.user);
    const planeToDelete = user.planes.find(element => element.icao == icaoToDelete);
    if (planeToDelete) {
        try {
            await PlaneStates.deleteByPlaneId(planeToDelete._id.toHexString());
            await user.deleteIcaoNumber(planeToDelete.icao);
            res.send({ message: `plain with icao number ${icaoToDelete} and it's travel history was removed from your list` });
        } catch (e) {
            res.status(400).send(e.message);
        };
    } else {
        res.status(400).send("Plane was not found in users plain list");
    };
})
//see the current plane info from users list
authRouter.get('/getCurrentPlaneStates', async (req, res, next) => {
    const icaoList = await User.getIcaoList(req.user.username);
    const planeIds = getUserPlaneIds();
    const planesCurrentData = [];
    for (const icao in planeIds) {
        let planeData = {};
        planeData.id = planeIds[icao];

        const planeStates = await PlaneStates.getCurrentStateByPlaneId(planeIds[icao]);
        planeData = { ...planeData, ...planeStates[0] };
        planesCurrentData.push(planeData);
    }
    res.send({ planesCurrentData });

    function getUserPlaneIds() {
        const planeDataObj = {};
        for (const icaoObj of icaoList) {
            planeDataObj[icaoObj.icao] = icaoObj.id;
        };
        return planeDataObj;
    };
});

authRouter.get('/getPlaneInfo/:planeId', async (req, res, next) => {
    PlaneStates.getTripsByPlaneId(req.params.planeId).then(planeObj => {
        res.send({ planeObj });
    });
});

function setAccessHeaders(res){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
}

module.exports = app;