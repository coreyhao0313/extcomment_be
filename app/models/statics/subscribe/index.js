const mongoose = require('mongoose');

module.exports = function (schema){
    schema.statics.createSubscription = function ({account, wid, kind, inid, aid}) {
        !!account && typeof account === 'string' && (account = mongoose.Types.ObjectId(account));
        !!wid && typeof wid === 'string' && (wid = mongoose.Types.ObjectId(wid));
        !!aid && typeof aid === 'string' && (aid = mongoose.Types.ObjectId(aid));
        !!inid && typeof inid === 'string' && (inid = mongoose.Types.ObjectId(inid));

        return this.create({
            account,
            kind,
            wid,
            aid,
            inid
        });
    };
    
    schema.statics.findSubscriptions = async function (query, fields = [], {sort, skip, paging, limit}) {
        !!query._id && typeof query._id === 'string' && (query._id = mongoose.Types.ObjectId(query._id));
        !!query.account && typeof query.account === 'string' && (query.account = mongoose.Types.ObjectId(query.account));
        !!query.wid && typeof query.wid === 'string' && (query.wid = mongoose.Types.ObjectId(query.wid));
        !!query.aid && typeof query.aid === 'string' && (query.aid = mongoose.Types.ObjectId(query.aid));
        !!query.inid && typeof query.inid === 'string' && (query.inid = mongoose.Types.ObjectId(query.inid));
        
        let accountOptionFields = fields
            .map((option)=> /account\..+/.test(option) && option.match(/^account\.(.+)$/)[1])
            .filter((option)=>option);
        let mainOptionFields = fields
            .filter((option)=> !/account\..+/.test(option));

        let find = this.find(query)
            .populate({
                path: 'account',
                select: '-_id ' + accountOptionFields.join(' ')
            })
            .select(mainOptionFields.join(' '));

       const findResult = await find;

        sort && (find = find.sort(sort));
        if(skip){
            find = find.skip(skip);
        }else{
            paging && limit && (find = find.skip(paging * limit - limit));
        }
        limit && (find = find.limit(limit));


        return find
            .then((data)=>{
                return {
                    data,
                    attrs: {
                        total: findResult.length,
                        got: data.length
                    }
                };
            });
    };
    
    schema.statics.updateSubscription = function (query, { account, kind, aid, wid, inid, read }) {
        !!query._id && typeof query._id === 'string' && (query._id = mongoose.Types.ObjectId(query._id));
        !!query.account && typeof query.account === 'string' && (query.account = mongoose.Types.ObjectId(query.account));
        !!query.aid && typeof query.aid === 'string' && (query.aid = mongoose.Types.ObjectId(query.aid));
        !!query.wid && typeof query.wid === 'string' && (query.wid = mongoose.Types.ObjectId(query.wid));
        !!query.inid && typeof query.inid === 'string' && (query.inid = mongoose.Types.ObjectId(query.inid));

        !!account && typeof account === 'string' && (account = mongoose.Types.ObjectId(account));
        !!aid && typeof aid === 'string' && (aid = mongoose.Types.ObjectId(aid));
        !!wid && typeof wid === 'string' && (wid = mongoose.Types.ObjectId(wid));
        !!inid && typeof inid === 'string' && (inid = mongoose.Types.ObjectId(inid));
        
        let data = {
            $set: {
                "status.updated": Date.now()
            }
        };
        !!account && (data.account = account);
        !!kind && (data.kind = kind);
        !!aid && (data.aid = aid);
        !!wid && (data.wid = wid);
        !!inid && (data.inid = inid);
        !!read && (data.read = read);

        return this.updateOne(query, data);
    };
};