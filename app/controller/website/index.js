const model = require('../../../app/models');
const webdriver = require('./webdriver');
const queue = {
    urls: []
};

module.exports = function({redisClient, redisClientAsyncGet}){
    
    return {
        async signin({ account, host, path }, beforeCreate){
            let dbWebsite = {
                host: null,
                path: null
            };
            if(host){
                host = host.toLowerCase();
                
                dbWebsite.host = await model.website.findWebsite({name: host});
                if(dbWebsite.host === null){
                    if(typeof beforeCreate === 'boolean'){
                        if(beforeCreate === false){
                            return ;
                        }
                    } else if(beforeCreate && await beforeCreate() === false){
                        return;
                    }
    
                    dbWebsite.host = await model.website.createWebsite({
                            account,
                            name: host,
                            kind: 'host'
                        });
                }
                
                if(path){
                    dbWebsite.path = await model.website.findWebsite({name: path});
                    if(dbWebsite.path === null){
                        dbWebsite.path = await model.website.createWebsite({
                            account,
                            name: path,
                            tid: dbWebsite.host._id,
                            kind: 'path',
                            locks: ['ref.origin']
                        });
                    }
                }
            }
            return dbWebsite;
        },
        async getOne(query = {}, fields){
            if(query && query.kind === 'host' && query.name){
                query.name = query.name.toLowerCase();
            }
            const dbWebsite = await model.website.findWebsite(query, fields);
            return dbWebsite && dbWebsite.toJSON();
        },
        async getInfo(url, config, force){
            const enUrl = encodeURIComponent(url);
            if(queue.urls.includes(enUrl)){
                let err = new Error('該對象取得操作正在處理中');
                err.code = 1;
                throw err;
            }
            if(queue.urls.length > 6){
                let err = new Error('操作延遲處理中');
                err.code = 2;
                throw err;
            }
            queue.urls.push(enUrl);
    
            let websiteInfo;
            const websiteInfoFromCache = await redisClientAsyncGet("website:url:" + enUrl).catch(new Function);
            if(websiteInfoFromCache && !force){
                websiteInfo = JSON.parse(websiteInfoFromCache);
            } else {
                websiteInfo = await webdriver.getInfo(url, config || {resize: 480})
                    .catch((err)=>{
                        const queueUrlIndex = queue.urls.indexOf(enUrl);
                        queueUrlIndex > -1 && queue.urls.splice(queueUrlIndex, 1);
                        throw err;
                    });
                redisClient.set("website:url:" + enUrl, JSON.stringify(websiteInfo), "EX", (60*60)*24);
            }
    
            const queueUrlIndex = queue.urls.indexOf(enUrl);
            queueUrlIndex > -1 && queue.urls.splice(queueUrlIndex, 1);
    
            return {
                url,
                ...websiteInfo
            };
        },
        async update(query = {}, data){
            return model.website.updateWebsite(query, data);
        },
    };
};