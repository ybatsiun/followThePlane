const http = require('http');
const querystring = require('querystring');
const http_service = require('./http_service');

const BASE_URL = 'http://open.mapquestapi.com/geocoding/v1/reverse';
const KEY = 'ilAZm6WX9GvgvjOHmZuqwG7c0dQUzJB2';


module.exports = {
    getPlaceByGeoCoordinates: (latitude, longitude) => {
        const parameters = querystring.stringify({
            key: KEY,
            thumbMaps: false,
            location: `${latitude},${longitude}`
        });
        return new Promise((resolve, reject) => {
            http.get(`${BASE_URL}?${parameters}`, res => {
                const httpService = new http_service();
                httpService.validateResponse(res);
                return httpService.processResponse(res).then(processedData => {
                    resolve(processedData);
                });
            }).on('error', (e) => {
                reject(e.message);
            });

        })
    }
}
