const https = require('https');
const baseUrl = 'https://opensky-network.org/api';
const getAll = '/states/all';

function getAllStates(req, globalResp, next) {
  https.get(`${baseUrl}${getAll}`, res => {
    validateResponse(res);
    moveDataToGlobalResponse(res, globalResp, next);
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    next();
  });
};

function getStateByIcao(req, globalResp, next) {
  const icao = req.params.icao;

  https.get(`${baseUrl}${getAll}?icao24=${icao}`, res => {
    validateResponse(res);
    moveDataToGlobalResponse(res, globalResp, next);
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    next();
  });
}

function validateResponse(res) {
  const { statusCode } = res;
  const contentType = res.headers['content-type'];

  let error;
  if (statusCode !== 200) {
    error = new Error('Request Failed.\n' +
      `Status Code: ${statusCode}`);
  } else if (!/^application\/json/.test(contentType)) {
    error = new Error('Invalid content-type.\n' +
      `Expected application/json but received ${contentType}`);
  }
  if (error) {
    console.error(error.message);
    // consume response data to free up memory
    res.resume();
    next();
  }
}
function moveDataToGlobalResponse(res, globalResp, next) {
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', chunk => { rawData += chunk; });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      globalResp.data = parsedData;
      next();
    } catch (e) {
      console.error(e.message);
    }
  });
}
module.exports = { getAllStates, getStateByIcao }