const mongoose = require('mongoose');

module.exports = function (schema){
    schema.statics.createComment = function ({ account, tid, kind, content }) {
        !!account && typeof account === 'string' && (account = mongoose.Types.ObjectId(account));
        !!tid && typeof tid === 'string' && (tid = mongoose.Types.ObjectId(tid));

        return this.create({
            account,
            tid,
            kind,
            content
        });
    };
    
    schema.statics.findComment = function (query, fields = []) {
        !!query._id && typeof query._id === 'string' && (query._id = mongoose.Types.ObjectId(query._id));
        !!query.account && typeof query.account === 'string' && (query.account = mongoose.Types.ObjectId(query.account));
        !!query.tid && typeof query.tid === 'string' && (query.tid = mongoose.Types.ObjectId(query.tid));

        let accountOptionFields = fields
            .map((option)=> /account\..+/.test(option) && option.match(/^account\.(.+)$/)[1])
            .filter((option)=>option);
        let mainOptionFields = fields
            .filter((option)=> !/account\..+/.test(option));
            
        return this.findOne(query)
            .populate({
                path: 'account',
                select: accountOptionFields.join(' ') // '-_id ' + accountOptionFields.join(' ')
            })
            .select(mainOptionFields.join(' '));
    };
    
    schema.statics.countComment = function (query) {
        !!query._id && typeof query._id === 'string' && (query._id = mongoose.Types.ObjectId(query._id));
        !!query.account && typeof query.account === 'string' && (query.account = mongoose.Types.ObjectId(query.account));
        !!query.tid && typeof query.tid === 'string' && (query.tid = mongoose.Types.ObjectId(query.tid));
        
        return this.countDocuments(query);
    };

    schema.statics.findComments = async function (query, fields = [], {sort, skip, paging, limit, aggregate}) {
        !!query._id && typeof query._id === 'string' && (query._id = mongoose.Types.ObjectId(query._id));
        !!query.account && typeof query.account === 'string' && (query.account = mongoose.Types.ObjectId(query.account));
        !!query.tid && typeof query.tid === 'string' && (query.tid = mongoose.Types.ObjectId(query.tid));

        let accountOptionFields = fields
            .map((option)=> /account\..+/.test(option) && option.match(/^account\.(.+)$/)[1])
            .filter((option)=>option);
        let mainOptionFields = fields
            .filter((option)=> !/account\..+/.test(option));

        let find;

        if(aggregate){
            find = this.aggregate(aggregate);
        }else{  
            find = this
                .find(query)
                .populate({
                    path: 'account',
                    select: accountOptionFields.join(' ') // '-_id ' + accountOptionFields.join(' ')
                })
                .select(mainOptionFields.join(' '));
        }

        if(!aggregate){
            sort && (find = find.sort(sort));
            if(skip){
                find = find.skip(skip);
            }else{
                paging && limit && (find = find.skip(paging * limit - limit));
            }
            limit && (find = find.limit(limit));
        }

        return find;
    };
    
    schema.statics.updateComment = function (query, { tid, account, kind, content, $set }) {
        !!query._id && typeof query._id === 'string' && (query._id = mongoose.Types.ObjectId(query._id));
        !!query.account && typeof query.account === 'string' && (query.account = mongoose.Types.ObjectId(query.account));
        !!query.tid && typeof query.tid === 'string' && (query.tid = mongoose.Types.ObjectId(query.tid));

        !!account && typeof account === 'string' && (account = mongoose.Types.ObjectId(account));
        !!tid && typeof tid === 'string' && (tid = mongoose.Types.ObjectId(tid));
        
        let data = {
            $set: {
                "status.updated": Date.now()
            }
        };
        !!$set && (data.$set = $set);
        !!tid && (data.tid = tid);
        !!account && (data.account = account);
        !!kind && (data.kind = kind);
        !!content && (data.content = content);

        return this.updateOne(query, data);
    };
};