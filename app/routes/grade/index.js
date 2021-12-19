const utilsApi = require('../../utils/api');
const src = require('../../src');
const controller = require('../../controller');

module.exports = {
    async create(ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));

        const tid = ctx.request.body.tid;
        const kind = ctx.request.body.kind;
        const liking = ctx.request.body.liking;
        
        const rsGrade = await src.grade.create({
            account: ctx.state.user._id,
            tid,
            kind,
            liking
        }, ctx.state.user.rules.includes('admin'));


        if(rsGrade && /^comment/.test(rsGrade.kind) && liking === 1){
            rsGrade.user = ctx.state.user;
            await controller.notification.emit('grade', rsGrade);
            delete rsGrade.user;
        }

        ctx.body = {
            status: 'success',
            data: utilsApi.getFieldsData(qb.fields, rsGrade)
        };
    },
    async getOne(ctx){
        const qbStr = utilsApi.getQueryStr(ctx);
        const qb = utilsApi.getBase64Data(qbStr);
        qb.filter = qb.filter || {};

        const rsGrade = await src.grade.getOne(qbStr, qb.filter, qb.fields);

        ctx.body = {
            status: 'success',
            data: rsGrade
        };
    },
    async getCount(ctx){
        const qbStr = utilsApi.getQueryStr(ctx);
        const qb = utilsApi.getBase64Data(qbStr);
        
        const rsGradeCount = await src.grade.getCount(qbStr, qb.filter);

        ctx.body = {
            status: 'success',
            data: rsGradeCount
        };
    },
    async delete(ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
        qb.filter = qb.filter || {};

        if(!ctx.state.user.rules.includes('admin') || !qb.filter.account){
            qb.filter.account = ctx.state.user._id;
        }
        
        const rsGrade = await src.grade.deleteOne(qb.filter);

        ctx.body = {
            status: 'success',
            data: rsGrade
        };
    }
};