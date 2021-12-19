const config = require('../config.json');
const redis = require("redis");
const redisClient = redis.createClient(config[process.env.NODE_ENV].redis);

const { promisify } = require('util');
const redisClientAsyncGet = promisify(redisClient.get).bind(redisClient);
const redisClientAsyncSmembers = promisify(redisClient.smembers).bind(redisClient);
const redisClientAsyncLrange = promisify(redisClient.lrange).bind(redisClient);
const redisClientAsyncScan = promisify(redisClient.scan).bind(redisClient);

async function scanByMatch (key, cursor, callback) {
    const rdResult = await redisClientAsyncScan(cursor, "MATCH", key, "COUNT", "500");
    
    callback(rdResult);
    if (rdResult[0] === '0'){
        return ;
        // return rdResult[1];
    }
    scanByMatch(key, rdResult[0], callback);
    // const rdDeepResultData = await splitHandler(rdResult[0]);
    // if (Array.isArray(rdDeepResultData)){
    //     return rdResult[1].concat(rdDeepResultData);
    // }
    // return rdResult[1];
}

const parent = {
    redisClient,
    redisClientAsyncGet,
    redisClientAsyncSmembers,
    redisClientAsyncLrange,
    redisClientAsyncScan,
    redisCreate(){
        return redis.createClient(config[process.env.NODE_ENV].redis);
    },
    scanByMatch
};

module.exports = {
    ...parent,
    account: require('./account')(parent),
    comment: require('./comment')(parent),
    grade: require('./grade')(parent),
    website: require('./website')(parent),
    notification: require('./notification')(parent)
};