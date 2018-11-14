const https = require('https');
const dateFormat = require('dateformat');

const http_service = require('./http_service');
const PlaneStates = require('../models/planeStates');
const User = require('../models/user');


const BASE_URL = 'https://opensky-network.org/api';
const GET_ALL = '/states/all';
const DEFAULT_NAMES = ['icao', 'callsign', 'origin_country', 'time_position', 'last_contact', 'longitude',
    'latitude', 'geo_altitude', 'on_ground', 'velocity', 'heading', 'vertical_rate', 'sensors', 'baro_altitude', 'squawk',
    'spi', 'position_source'];

module.exports = {
    getStateByIcao: (icao) => {
        return new Promise((resolve, reject) => {
            https.get(`${BASE_URL}${GET_ALL}?icao24=${icao}`, res => {
                const httpService = new http_service();
                httpService.validateResponse(res);
                return httpService.processResponse(res).then(processedData => {
                    if (processedData.states == null) {
                        resolve(processedData.states);
                    } else {
                        const planeData = {};
                        for (let i = 0; i < DEFAULT_NAMES.length - 1; i++) {
                            planeData[DEFAULT_NAMES[i]] = processedData.states[0][i];
                        };
                        resolve(planeData);
                    }
                });
            }).on('error', (e) => {
                reject(e.message);
            });
        })
    },

    fetchPlanesData: async function fetchPlanesData() {
        const planeStateList = await PlaneStates.getAllIds();
        for (const planeId of planeStateList) {
            const { icao } = await PlaneStates.findByDefaultId(planeId);
            const states = await this.getStateByIcao(icao);
            console.log('data for ' + icao + ' at ' + dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss"));
            await PlaneStates.writeDataByPlaneId(planeId, states);
        };
    }
}