const mongoose = require('mongoose');

module.exports = function (schema) {
    schema.statics.createAccount = function ({ pfid, email, avatar, name, nick, note }) {
        return this.create({pfid, email, avatar, name, nick, note});
    };
    
    schema.statics.findAccount = function (query, fields = []) {
        !!query._id && typeof query._id === 'string' && (query._id = mongoose.Types.ObjectId(query._id));
        return this.findOne(query).select(fields.join(' '));
    };

    schema.statics.updateAccount = function (query, {email, avatar, name, nick, rules} ){
        let data = {
            "status.updated": Date.now()
        };
        !!email && (data.email = email);
        !!avatar && (data.avatar = avatar);
        !!name && (data.name = name);
        !!nick && (data.nick = nick);
        !!rules && Array.isArray(rules) && (data.rules = rules);
        
        return this.updateOne(query, {"$set": data}, {upsert: true, setDefaultsOnInsert: true});
    };
};