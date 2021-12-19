const mongoose = require('mongoose');

module.exports = function (schema){
    schema.statics.createGrade = function ({account, tid, kind, liking}) {
        !!account && typeof account === 'string' && (account = mongoose.Types.ObjectId(account));
        !!tid && typeof tid === 'string' && (tid = mongoose.Types.ObjectId(tid));

        return this.create({
            account,
            kind,
            tid,
            liking
        });
    };
    
    schema.statics.deleteGrade = function ({account, tid, kind, liking}) {
        !!account && typeof account === 'string' && (account = mongoose.Types.ObjectId(account));
        !!tid && typeof tid === 'string' && (tid = mongoose.Types.ObjectId(tid));

        return this.deleteOne({
            account,
            kind,
            tid,
            liking
        });
    };

    schema.statics.findGrade = function (query, fields = []) {
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

    schema.statics.countGrade = function (query) {
        !!query._id && typeof query._id === 'string' && (query._id = mongoose.Types.ObjectId(query._id));
        !!query.account && typeof query.account === 'string' && (query.account = mongoose.Types.ObjectId(query.account));
        !!query.tid && typeof query.tid === 'string' && (query.tid = mongoose.Types.ObjectId(query.tid));
        
        return this.countDocuments(query);
    };

};