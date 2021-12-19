const request = require('request');
const {
    promisify
} = require('util');
const requestAsync = promisify(request);
const controller = require('../../../app/controller');

module.exports = {
    async signin({
        account,
        protocol,
        host,
        path
    }, headers = {}) {
        return controller.website.signin({
            account,
            protocol,
            host,
            path
        }, () => {
            return this.verifyUrl(protocol, host, path, headers);
        });
    },
    getOne(query, fields) {
        return controller.website.getOne(query, fields);
    },
    async getInfo({
        protocol,
        host,
        path,
        config,
        force
    }) {
        const [url, headers] = await this.verifyUrl(protocol, host, path, null, true);
        if(headers && "content-type" in headers){
            if(/^image/.test(headers["content-type"])){
                return {
                    url,
                    screenshot: url
                }
            }
        }
        
        return controller.website.getInfo(url, config, force);
    },
    update(query, data) {
        return controller.website.update(query, data);
    },
    async verifyUrl(protocol = 'https:', host, path = '', headers) {
        const url = protocol + '//' + host + '/' + path;

        try {
            let config = {
                url,
                timeout: 5000
            };
            if (typeof headers === 'object' && headers !== headers) {
                config.headers = {
                    "user-agent": headers["user-agent"]
                };
            }
            const res = await requestAsync(config);
            
            if (res.statusCode < 200 || res.statusCode > 300 ||
                res.headers && !(
                    /^(text\/html|image\/)/.test(res.headers["content-type"])
                )) {
                throw new Error('無效網址');
            }
            return [url, res.headers];

        } catch (err) {
            if (protocol === 'http:') {
                throw new Error('無效網址');
            }
            return this.verifyUrl('http:', host, path, headers);
        }
    }
};