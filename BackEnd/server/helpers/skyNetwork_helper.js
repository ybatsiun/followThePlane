const https = require('https');
const baseUrl = 'https://opensky-network.org/api';
const getAll = '/states/all';
const http_helper = require('./http_helper');
const PlaneStates = require('../models/planeStates');
const User = require('../models/user');
const dateFormat = require('dateformat');

module.exports = {
    getStateByIcao: (icao) => {
        return new Promise((resolve, reject) => {
            https.get(`${baseUrl}${getAll}?icao24=${icao}`, res => {
                const h_helper = new http_helper();
                h_helper.validateResponse(res);
                return h_helper.processResponse(res).then(processedData => {
                    if (processedData.states !== null) {
                        resolve(processedData.states[0]);
                    } else {
                        //if there is no data about the plane
                        const noDataArray = new Array(17);
                        resolve(noDataArray.fill('NO DATA', 0, 17))
                    }
                });
            }).on('error', (e) => {
                reject(e.message);
            });
        })
    },

    fetchPlanesData: async function fetchPlanesData() {
        const planeStateList = await PlaneStates.getAllIds();
        for (const planeState of planeStateList) {
            const icao = await User.getIcaoByPlaneID(planeState.planeID);
            const states = await this.getStateByIcao(icao);
            console.log('writing data for ' + icao + ' at ' + dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss"));
            await PlaneStates.writeDataByPlaneId(planeState.planeID, states);
        };
    }
}