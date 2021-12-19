const utilsApi = require('../../utils/api');
const src = require('../../src');

module.exports = {
    async getAndRealTime (ctx){
        let done = false;
        let timeout = false;

        const redisSubscription = await src.notification.onMessage(ctx.state.user._id, 60000)
            .catch(()=>{
                timeout = true;

                if(done){
                    return;
                }
                ctx.status = 410;
                ctx.body = {
                    code: ctx.status,
                    status: 'error',
                    message: '',
                    data: null
                };
            });
            
            if(timeout){
                return;
            }
            ctx.body = {
                status : "success",
                data : redisSubscription.message
            };
            done = true;
    },
    async get (ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
        qb.filter = qb.filter || {};
        
        if(!ctx.state.user.rules.includes('admin') || !qb.filter.account){
            qb.filter.account = ctx.state.user._id;
        }
        const dbSubscription = await src.notification.get(qb.filter, qb.fields, {
            sort: qb.sort,
            skip: qb.skip,
            paging: qb.paging,
            limit: qb.limit || 500
        });

        ctx.body = {
            status: 'success',
            data: dbSubscription
        };
    },
    async updateToRead(ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
        qb.filter = qb.filter || {};

        if(!ctx.state.user.rules.includes('admin') || !qb.filter.account){
            qb.filter.account = ctx.state.user._id;
        }
        const dbSubscription = await src.notification.updateToRead(qb.filter);

        ctx.body = {
            status: 'success',
            data: dbSubscription
        };
    }
};