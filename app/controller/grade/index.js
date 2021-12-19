const model = require('../../../app/models');
const utilsApi = require('../../utils/api');

module.exports = function({redisClient, redisClientAsyncGet, scanByMatch}){
    const controllerComment = require('../comment')({redisClientAsyncGet});

    return {
        async create(data = {}, allowRepeat){
            if(!allowRepeat){
                if(await model.grade.findGrade({
                    account: data.account,
                    tid: data.tid,
                    kind: data.kind
                }, ['_id'])){
                    return;
                }
            }
            
            if(data.tid){
                controllerComment.getOne({_id: data.tid}, ['tid'])
                    .then((rsComment)=>{
                        if(rsComment && rsComment.tid){
                            /* 因讚數而影響該筆之排序則需清除回應相關快取 */
                            scanByMatch(`comment:page:${rsComment.tid}:*`, '0',
                                (rdResult)=> rdResult[1].map((rdkey) => redisClient.del(rdkey)) // 清除 tid 相關分頁快取
                            );
                        }
                    });
            }

            /* 清除所有讚相關快取 */
            scanByMatch(`grade:*`, '0',
                (rdResult)=> rdResult[1].map((rdkey) => redisClient.del(rdkey)) // 清除 tid 相關分頁快取
            );

            const dbGrade = await model.grade.createGrade(data);
            return dbGrade && dbGrade.toJSON();
        },
        async getOne(rdkey, query = {}, fields){
            let dbGrade;

            dbGrade = await redisClientAsyncGet(`grade:user:${rdkey}`);
            if(dbGrade){
                return utilsApi.getFieldsData(fields, JSON.parse(dbGrade)); // RD
            }

            dbGrade = await model.grade.findGrade(query, fields);
            dbGrade = dbGrade && dbGrade.toJSON();
            redisClient.set(`grade:user:${rdkey}`, JSON.stringify(dbGrade) , "EX", ((60*60)*24)*7);
            return dbGrade; //DB
        },
        async getCount(rdkey, query){
            let dbGradeCount;

            dbGradeCount = await redisClientAsyncGet(`grade:count:${rdkey}`);
            if(dbGradeCount){
                return parseInt(dbGradeCount); // RD
            }

            dbGradeCount = await model.grade.countGrade(query);
            redisClient.set(`grade:count:${rdkey}`, dbGradeCount.toString() , "EX", ((60*60)*24)*7);
            return dbGradeCount; // DB
        },
        deleteOne(query = {}){
            if(query.tid){
                controllerComment.getOne({_id: query.tid}, ['tid'])
                    .then((rsComment)=>{
                        if(rsComment && rsComment.tid){
                            /* 因讚數而影響該筆之排序則需清除回應相關快取 */
                            scanByMatch(`comment:page:${rsComment.tid}:*`, '0',
                                (rdResult)=> rdResult[1].map((rdkey) => redisClient.del(rdkey)) // 清除 tid 相關分頁快取
                            );
                        }
                    });
            }

            /* 清除所有讚相關快取 */
            scanByMatch(`grade:*`, '0',
                (rdResult)=> rdResult[1].map((rdkey) => redisClient.del(rdkey)) // 清除 tid 相關分頁快取
            );

            return model.grade.deleteGrade(query);
        }
    };
};