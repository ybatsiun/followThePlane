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
                    resolve(processedData.states);
                });
            }).on('error', (e) => {
                reject(e.message);
            });
        })

    },

    getPlanesStates: async function getPlanesStates() {
        const planeStateList = await PlaneStates.getAllIds();
        for (const planeState of planeStateList) {
            const icao = await User.getIcaoByPlaneID(planeState.planeID);
            const states = await this.getStateByIcao(icao);
            console.log('writing data for ' + icao + ' at ' + dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss"));
            await PlaneStates.writeDataByPlaneId(planeState.planeID, states);
        };
    }
}