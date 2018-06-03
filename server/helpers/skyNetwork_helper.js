const https = require('https');
const baseUrl = 'https://opensky-network.org/api';
const getAll = '/states/all';
const http_helper = require('./http_helper');


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

    }
}