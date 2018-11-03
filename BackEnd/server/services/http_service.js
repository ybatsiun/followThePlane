class HttpService {
    validateResponse(res) {
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
        }
    }

    //part of middleware 
    moveDataToGlobalResponse(res, globalResp, next) {
        return this.processResponse(res).then(processedData => {
            globalResp.data = processedData;
        })
    }

    processResponse(res) {
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', chunk => { rawData += chunk; });
        return new Promise((resolve, reject) => {
            res.on('end', () => {
                try {
                    resolve(JSON.parse(rawData));
                } catch (e) {
                    reject(e.message);
                };
            });
        });
    }
}

module.exports = HttpService;