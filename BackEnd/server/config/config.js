
var config = require('./config.json');
var env = (process.env.NODE_ENV || 'development').trim();
if (env == 'development') {
    Object.keys(config.development).forEach((key) => {
        process.env[key] = config.development[key];
    });
} else if (env == 'test') {
    console.log('setting test config...')
    Object.keys(config.test).forEach((key) => {
        process.env[key] = config.test[key];
    });
}
