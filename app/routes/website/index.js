const utilsApi = require('../../utils/api');
const src = require('../../src');

module.exports = {
    async signin(ctx){
        const protocol = ctx.request.body.protocol;
        const host = ctx.request.body.host;
        let path = ctx.request.body.path;
        path = typeof path === 'string' && path[0] === '/' ? path.substr(1) : path;

        if(host){
            const rsWebsite = await src.website.signin({
                account: ctx.state.user && ctx.state.user._id,
                protocol,
                host,
                path
            }, ctx.headers);
            
			ctx.body = {
				status: 'success',
				data: rsWebsite
            };
        }else{
			ctx.status = 406;
			ctx.body = {
				code: ctx.status,
				status: 'error',
				message: '缺少必要的值',
				data: null
			};
        }
    },
    async getOne(ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
        
        const rsWebsite = await src.website.getOne(qb.filter, qb.fields);

        ctx.body = {
            status: 'success',
            data: rsWebsite
        };
    },
    async getInfo(ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
        qb.path = typeof path === 'string' && qb.path[0] === '/' ? qb.path.substr(1) : qb.path;

        if(!ctx.state.user.rules.includes('admin')){
            qb.force = false;
        }

        const websiteInfo = await src.website.getInfo(qb)
            .catch((err)=>{
                if(err.code === 1 || err.code === 2){
                    ctx.throw(429, err);
                }else{
                    throw err;
                }
            });

        ctx.body = {
            status: 'success',
            data: utilsApi.getFieldsData(qb.fields, websiteInfo)
        };
    },
    async update(ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
        const body = ctx.request.body;
        
        if(ctx.state.user.rules.includes('admin')){
            const rsWebsite = await src.website.update(qb.filter, body);

            ctx.body = {
                status: 'success',
                data: utilsApi.getFieldsData(qb.fields, rsWebsite)
            };
        }else{
            ctx.status = 401;
            ctx.body = {
                code: ctx.status,
				status: 'error'
            };
        }
    }
};