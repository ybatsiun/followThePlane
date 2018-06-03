const https = require('https');
const baseUrl = 'https://opensky-network.org/api';
const getAll = '/states/all';
const http_helper = require('./../../helpers/http_helper')

function getAllStates(req, globalResp, next) {
  https.get(`${baseUrl}${getAll}`, res => {
    const h_helper = new http_helper();
    h_helper.validateResponse(res);
    h_helper.moveDataToGlobalResponse(res, globalResp).then(() => {
      next();
    })
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    next();
  });
};

function getStateByIcao(req, globalResp, next) {
  const icao = req.params.icao;

  https.get(`${baseUrl}${getAll}?icao24=${icao}`, res => {
    const h_helper = new http_helper();
    h_helper.validateResponse(res);
    h_helper.moveDataToGlobalResponse(res, globalResp);
    next();
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    next();
  });
}

module.exports = { getAllStates, getStateByIcao }