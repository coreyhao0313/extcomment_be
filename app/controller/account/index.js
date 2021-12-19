const model = require('../../../app/models');
const utilsApi = require('../../utils/api');

module.exports = function({redisClient, redisClientAsyncGet}){
    
    return {
        async create(data){
            const dbAccount = await model.account.createAccount(data);
            return dbAccount && dbAccount.toJSON();
        },
        update(query, data){
            return model.account.updateAccount(query, data);
        },
        async findOne(query, fields){
            const dbAccount = await model.account.findAccount(query, fields);
            return dbAccount && dbAccount.toJSON();
        },
        async getOneById(_id, fields){
            const token = await this.getToken(_id);
            if(token){
                const user = await this.getState(token);
                if (user) {
                    return utilsApi.getFieldsData(fields, user);
                }
            }
            return this.findOne({_id}, fields);
        },
        setToken(id, token){
            redisClient.set("user:token:" + id, token, "EX", (60*60)*24*30);
        },
        getToken(id){
            return redisClientAsyncGet("user:token:" + id);
        },
        delToken(id){
            redisClient.del("user:token:" + id);
        },
        setState(token, user){
            redisClient.set("user:state:" + token, JSON.stringify(user), "EX", (60*60)*24*30);
        },
        async getState(token){
            const userStr = await redisClientAsyncGet("user:state:" + token) || '{}';
            return JSON.parse(userStr);
        },
        delState(token){
            redisClient.del("user:state:" + token);
        }
    };
};