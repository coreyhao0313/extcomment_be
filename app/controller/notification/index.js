const mongoose = require('mongoose');
const model = require('../../../app/models');
const utilsApi = require('../../utils/api');

module.exports = function({redisCreate, redisClientAsyncGet}){
    const controllerComment = require('../comment')({redisClientAsyncGet});
    const controllerAccount = require('../account')({redisClientAsyncGet});
    const sub = redisCreate();
    const pub = redisCreate();

    const target = {
        keys: [],
        funcs: [],
        syncErr: 0
    };

    sub.subscribe("comment");
    sub.subscribe("grade");
    sub.subscribe("event");
    sub.subscribe("tag");


    sub.on("message", (channel, message)=> {
        const subscriber = JSON.parse(message);

        if(subscriber.account && target.keys.includes(subscriber.account._id)){
            if(target.keys.length !== target.funcs.length){
                console.error('syncErr:', target.syncErr);
                return;
            }
            const targetIndex = target.keys.indexOf(subscriber.account._id);

            target.funcs[targetIndex]({channel, message: subscriber});

            target.keys.splice(targetIndex, 1);
            target.funcs.splice(targetIndex, 1);
        }  else if(channel === 'event') { // 未指定則在線者全部發送
            target.funcs.map(targetFunc => targetFunc({channel, message: subscriber}));

            target.keys = [];
            target.funcs = [];
        }
    });

    return {
        sub,
        pub,
        target,
        get(query = {}, fields, options){
            let account = {$in: [null]};
            if(query.account){
                account.$in.unshift(typeof query.account === 'string' && mongoose.Types.ObjectId(query.account) || query.account);
            }
            query.account = account;
            return model.subscribe.findSubscriptions(query, fields, options);
        },
        updateToRead (query){
            return model.subscribe.updateSubscription(query, {
                read: Date.now()
            });
        },
        async emit(kind, data){
            data.user = utilsApi.getFieldsData(['_id', 'name'], data.user);
            let dbSubscription = null;
            let dbComment = await controllerComment.getOne({_id: data.tid},[ 
                '_id',
                'tid',
                'account',
                'kind',
                'content',
                'status' ]); // 對象之回覆
                
            switch(kind){
                case "tag":

                    data.tags && !Array.isArray(data.tags) && (data.tags = [data.tags]);
                    dbSubscription = await Promise.all(
                        data.tags
                            .filter((accountId)=>accountId && data.user._id !== accountId)
                            .map(async (accountId)=>{
                                const dbSubscribe = await model.subscribe.createSubscription({
                                    account: accountId, // 訂閱者 = 被操作對象 ( 僅 _id
                                    kind,
                                    wid: data.account, // 觸發者 = 操作者 ( 僅 _id
                                    inid: dbComment._id,
                                    aid: data._id
                                });
                                return dbSubscribe && dbSubscribe.toJSON();
                            })
                    );
                    
                    dbSubscription.map(async (dbSubscription)=>{
                        const account = await controllerAccount.getOneById(dbSubscription.account, ['_id', 'name']);
                        pub.publish(kind, JSON.stringify({
                            _id: dbSubscription._id,
                            account: {_id: account._id}, // 訂閱者 = 被操作對象
                            kind,
                            who: data.user, // 觸發者 = 操作者
                            in: ((dbComment)=>{
                                delete dbComment.account;
                                return dbComment;
                            })(dbComment),
                            aid: data._id
                        }));
                    });

                break;

                default:

                    if (dbComment.account._id !== data.user._id) {
                        dbSubscription = await model.subscribe.createSubscription({
                            account: dbComment.account._id, // 訂閱者 = 被操作對象 ( 僅 _id
                            kind,
                            wid: data.account, // 觸發者 = 操作者 ( 僅 _id
                            inid: dbComment._id,
                            aid: data._id
                        });
                        dbSubscription = dbSubscription && dbSubscription.toJSON();
                    
                        pub.publish(kind, JSON.stringify({
                            _id: dbSubscription._id,
                            account: {_id: dbComment.account._id}, // 訂閱者 = 被操作對象
                            kind,
                            who: data.user, // 觸發者 = 操作者
                            in: ((dbComment)=>{
                                delete dbComment.account;
                                return dbComment;
                            })(dbComment),
                            aid: data._id
                        }));
                    }
                    
                break;
            }

            return dbSubscription;
        },
        setSubscriber(key, callback) {
            if(target.keys.length === target.funcs.length){
                let targetIndex = target.keys.indexOf(key);
                if(targetIndex > -1){
                    target.funcs[targetIndex] = callback;
                }else{
                    targetIndex = target.keys.push(key) - 1;
                    target.funcs.push(callback);
                }
                return targetIndex;
            }
            ++target.syncErr;
            console.error('syncErr:', target.syncErr);
        },
        delSubscriber(key) {
            if(target.keys.length === target.funcs.length){
                const targetIndex = target.keys.indexOf(key);
                if(targetIndex > -1){
                    target.keys.splice(targetIndex, 1);
                    target.funcs.splice(targetIndex, 1);
                }
                return true;
            }
            ++target.syncErr;
            console.error('syncErr:', target.syncErr);
        }
    };
};