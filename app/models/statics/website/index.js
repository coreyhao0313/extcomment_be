const mongoose = require('mongoose');

module.exports = function (schema){
    schema.statics.createWebsite = function ({account, name, tid, kind, locks, note}) {
        !!account && typeof account === 'string' && (account = mongoose.Types.ObjectId(account));
        !!tid && typeof tid === 'string' && (tid = mongoose.Types.ObjectId(tid));

        return this.create({
            account,
            name,
            tid,
            kind,
            locks,
            note
        });
    };
    
    schema.statics.findWebsite = function (query, fields = []) {
        !!query._id && typeof query._id === 'string' && (query._id = mongoose.Types.ObjectId(query._id));
        !!query.account && typeof query.account === 'string' && (query.account = mongoose.Types.ObjectId(query.account));
        !!query.tid && typeof query.tid === 'string' && (query.tid = mongoose.Types.ObjectId(query.tid));
        
        return this.findOne(query)
            .select(fields.join(' '));
    };

    schema.statics.updateWebsite = function (query, { tid, account, kind, name, locks, note, $set }){
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
        !!name && (data.name = name);
        !!Array.isArray(locks) && (data.locks = locks);
        !!note && (data.note = note);

        return this.updateOne(query, data);
    };
};