
var config = require('./config.json');
var envConfig = config['development'];
Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
});