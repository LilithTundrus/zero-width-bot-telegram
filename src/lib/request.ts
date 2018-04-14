import * as request from 'request';

/**
 * Request an URL using a given user agent
 * @param {URL} url 
 * @returns {Promise<any>}
 */
function requestUrl(url: string, userAgent: string): Promise<any> {
    let options = {
        uri: url,
        headers: { 'User-Agent': userAgent },
        json: true
    };
    return new Promise((resolve, reject) => {
        request.get(options, function (err: Error, response, body) {
            if (err) return reject(err);
            return resolve(body);
        })
    })
}

export { requestUrl };