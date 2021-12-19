const utilsApi = require('../../utils/api');
const src = require('../../src');
const controller = require('../../controller');

module.exports = {
    async create(ctx){
		const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
        const account = ctx.request.body.account;
        const tid = ctx.request.body.tid;
        const kind = ctx.request.body.kind;
        const content = ctx.request.body.content;
        const tags = ctx.request.body.tags;
        
        if(!ctx.state.user._id && kind === 'reply') { //匿名權限
            ctx.status = 401;
            ctx.body = {
                code: ctx.status
            };
            return ;
        }

        let rsComment = await src.comment.create({
            account: ctx.state.user.rules.includes('admin') && account || ctx.state.user._id,
            tid,
            kind,
            content
        });
        
        if(rsComment && rsComment.kind === 'reply'){
            rsComment.user = ctx.state.user;
            
            await Promise.all([
                controller.notification.emit('comment', rsComment),
                controller.notification.emit('tag', {
                    tags,
                    ...rsComment
                })
            ]);
            delete rsComment.user;
        }
        
        ctx.body = {
            status: 'success',
            data: utilsApi.getFieldsData(qb.fields, rsComment)
        };
    },
    async getOne(ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
        
        const rsComment = await src.comment.getOne(qb.filter, qb.fields);
        
        ctx.body = {
            status: 'success',
            data: rsComment
        };
    },
    async get(ctx){
        const qbStr = utilsApi.getQueryStr(ctx);
        const qb = utilsApi.getBase64Data(qbStr);
        let handles = [];

        handles.push(src.comment.get(qbStr, qb.filter, qb.fields, {
            sort: qb.sort,
            skip: qb.skip,
            paging: qb.paging,
            limit: qb.limit || 500
        }));

        qb.detal && handles.push(src.comment.getCount(qb.filter));

        const [rsComments, rsCommentCount] = await Promise.all(handles);

        let rsData = rsComments;
        if(qb.detal){
            rsData = {
                data: rsComments,
                attrs: {
                    total: rsCommentCount
                }
            };
        }

        ctx.body = {
            status: 'success',
            data: rsData
        };
    },
    async getCount(ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));

        const commentCount = await src.comment.getCount(qb.filter);

        ctx.body = {
            status: 'success',
            data: commentCount
        };
    },
    async update(ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
        const content = ctx.request.body.content;
        qb.filter = qb.filter || {};

        if(!ctx.state.user.rules.includes('admin')){
            qb.filter.account = ctx.state.user._id;
        }
        
        const rsComment = await src.comment.update(qb.filter, {content});

        ctx.body = {
            status: 'success',
            data: utilsApi.getFieldsData(qb.fields, rsComment)
        };
    },
    async delete(ctx){
        const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
        qb.filter = qb.filter || {};

        if(!ctx.state.user.rules.includes('admin')){
            qb.filter.account = ctx.state.user._id;
        }
        const rsComment = await src.comment.updateToSoftDelete(qb.filter);

        ctx.body = {
            status: 'success',
            data: utilsApi.getFieldsData(qb.fields, rsComment)
        };
    }
};