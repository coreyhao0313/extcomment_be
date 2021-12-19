const model = require('../../../app/models');
const utilsApi = require('../../utils/api');

module.exports = function({redisClient, redisClientAsyncGet, redisClientAsyncLrange, scanByMatch}){
    
    return {
        async create(data = {}){
            if(data.tid){
                scanByMatch(`comment:page:${data.tid}:*`, '0',
                    (rdResult)=> rdResult[1].map((rdkey) => redisClient.del(rdkey)) // 清除 tid 相關分頁快取
                );
                redisClient.del(`comment:count:${data.tid}`);
            }

            const dbComment = await model.comment.createComment(data);
            return dbComment && dbComment.toJSON();
        },
        async getOne(query = {}, fields, options = {}){
            const queryKeys = Object.keys(query);
            if(queryKeys.length === 1 && query._id){
                const rdComment = await redisClientAsyncGet(`comment:row:${query._id}`);
                if(rdComment){
                    return utilsApi.getFieldsData(fields, JSON.parse(rdComment)); // RD
                }
            }

            if(!options.queryByAllStatus){
                query["status.deleted"] = null;
            }
            const dbComment = await model.comment.findComment(query, fields);
            return dbComment && dbComment.toJSON(); // DB
        },
        async get(rdkey, query = {}, fields, options = {}){
            if(query.tid){ // tid 作為 redis key 匹配條件
                const rdCommentIds = await redisClientAsyncLrange(`comment:page:${query.tid}:${rdkey}`, 0, -1);
        
                if(Array.isArray(rdCommentIds) && rdCommentIds.length > 1){
                    
                    const rdCommentsPromise = rdCommentIds
                        .map((commentId) => redisClientAsyncGet(`comment:row:${commentId}`));
        
                    const rdCommentsStr = await Promise.all(rdCommentsPromise);
        
                    if(rdCommentsStr.every((commentStr)=>commentStr)){
                        return rdCommentsStr.map(JSON.parse); // RD
                    }
                }
            }
    
            !fields.includes('tid') && fields.push('tid'); // 撈取包含 tid 必須

            const dbComments = await this.find(query, fields, options);
    
            if(dbComments.length && query.tid){ // 及 tid 作為 redis key 匹配條件 寫進 redis
                dbComments.map((comment)=> {
                    comment._id = comment._id.toString();
                    comment.tid = comment.tid.toString();
                    redisClient.set(`comment:row:${comment._id}`, JSON.stringify(comment) , "EX", ((60*60)*24)*7);
                    redisClient.rpush(`comment:page:${query.tid}:${rdkey}`, comment._id);
                });
                redisClient.expire(`comment:page:${query.tid}:${rdkey}`, ((60*60)*24)*7);
            }
            
            return dbComments; // DB
        },
        async find(query, fields, options = {}){
            let projectField = {};
            fields
                .filter((key)=>key !== 'account')
                .map((key)=>projectField[key] = 1);
    
            query["status.deleted"] = null;
            options.aggregate = [
                        {
                            "$match": query
                        },
                        {
                            "$lookup": {
                                "from": "accounts",
                                "localField": "account",
                                "foreignField": "_id",
                                "as": "account"
                            }
                        },
                        { "$unwind": { "path": "$account", "preserveNullAndEmptyArrays": true } },
                        {
                            "$lookup": {
                                "from": "grades",
                                "localField": "_id",
                                "foreignField": "tid",
                                "as": "grades"
                            }
                        },
                        { "$unwind": { "path": "$grades", "preserveNullAndEmptyArrays": true } },
                        {
                            "$group": {
                                "_id": "$_id",
                                "grade_count":{
                                    "$sum": { 
                                        "$cond":[
                                            {"$eq":["$grades.liking", 1] }, 1,
                                            {"$cond":[{"$eq":["$grades.liking", -1] }, -1, 0]}
                                        ]
                                    }
                                },
                                "kind" : { "$first": "$kind" },
                                "content" : { "$first": "$content" },
                                "tid" : { "$first": "$tid" },
                                "status" : { "$first": "$status" },
                                "account": { "$first": "$account"}
                            }
                        }
            ];
    
            options.sort && options.aggregate.push({ "$sort": options.sort });
            if(options.skip){
                options.skip && options.aggregate.push({"$skip": options.skip});
            }else{
                if(options.paging && options.limit){
                    options.aggregate.push({"$skip": options.paging * options.limit - options.limit});
                }
            }
            options.limit && options.aggregate.push({"$limit": options.limit});
    
            // 選定欄位-最後
            options.aggregate.push({
                "$project": projectField
            });
            return model.comment.findComments(query, fields, options);
        },
        async getCount(query){
            const queryKeys = Object.keys(query);
            if(queryKeys.length === 2 && queryKeys.includes("tid") && query.kind === 'reply'){ // get something from redis by specific tid only
                const rdCount = await redisClientAsyncGet(`comment:count:${query.tid}`);
                if(rdCount){
                    return rdCount !== null && parseInt(rdCount); // RD
                }
            } else {
                query["status.deleted"] = null;
                return model.comment.countComment(query);
            }
            
            query["status.deleted"] = null;
            const dbCount = await model.comment.countComment(query);
            redisClient.set(`comment:count:${query.tid}`, dbCount , "EX", ((60*60)*24)*7);
            return dbCount; // DB
        },
        async update(query = {}, data){
            const dbUpdateComment = await model.comment.updateComment(query, data);
    
            if(dbUpdateComment.nModified && query._id){
                const dbComment = await model.comment.findComment(query);
    
                if(dbComment){
                    redisClient.set(`comment:row:${query._id}`, JSON.stringify(dbComment.toJSON()) , "EX", (60*60)*24);
                }
            }
    
            return dbUpdateComment;
        },
        async updateToSoftDelete(query = {}){
            const dbSoftDeleteComment = await model.comment.updateComment(query, {
                $set: {
                    "status.deleted": Date.now()
                }
            });
    
            if(dbSoftDeleteComment.nModified && query._id){
                redisClient.del(`comment:row:${query._id}`);
                
                this.getOne({_id: query._id}, ['tid'], {queryByAllStatus: true})
                    .then((dbComment)=>{
                        if(dbComment.tid){
                            redisClient.del(`comment:count:${dbComment.tid}`);
                        }
                    });
            }
    
            return dbSoftDeleteComment;
        }
    };
};