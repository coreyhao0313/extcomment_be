const redis = require("redis");
const pub = redis.createClient();
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
const readlineRuestion = (comment)=> new Promise((resolve, reject)=>{
    readline.question(comment, resolve);
});

const model = require('../app/models');
const commentSrc = require('../app/src/comment');

setTimeout(stepByStepCommand, 3000);

async function stepByStepCommand() {
    const aid = await readlineRuestion('推送動作(aid)\n');
    const dbComment = await commentSrc.getOne({_id: aid}); // 對象之回覆
    if(!dbComment){
        console.log('>>aid不存在');
        process.exit(0);
    }
    const kind = await readlineRuestion('推送類型(kind) 預設event\n') || 'event';
    let inid = null;
    if(kind !== 'event'){
       inid = await readlineRuestion('推送觸發位置(inid)\n');
    }

    const accountStr = await readlineRuestion('推送對象(uid) 預設全部 多個以,區隔\n');
    
    if(await readlineRuestion('確定建立及推送？ y/n \n') === 'y'){
        (function(f, accounts){
            f(f, accounts);
        })(async function(f, accounts){
            const account = accounts.shift().trim();
            // send start
            let publishData = {
                _id: null,
                account: {_id: account || null}, // 訂閱者 = 被操作對象 || null 為全部人接收
                kind: kind,
                who: null, // 觸發者 = 操作者
                aid: aid
            };
            if(kind === 'event'){
                publishData.in = ((dbComment)=>{
                    delete dbComment.account;
                    return dbComment;
                })(dbComment.toJSON());
            } else {
                publishData.inid = inid;
            }

                const dbSubscription = await model.subscribe.createSubscription({
                    account: publishData.account._id, // 訂閱者 = 被操作對象 ( 僅 _id
                    kind: publishData.kind,
                    wid: null, // 觸發者 = 操作者 ( 僅 _id
                    inid: dbComment._id,
                    aid: publishData.aid
                });
        
                publishData._id = dbSubscription._id;
        
            pub.publish('event', JSON.stringify(publishData));
            console.log('>>ok');
            // send end
    
            if(accounts.length){
                return f(f, accounts);
            }
            process.exit(0);
        }, accountStr.split(','));
    } else {
        process.exit(0);
    }
}