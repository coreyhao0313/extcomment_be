const mongoose = require('mongoose');
const Promise = require('bluebird');

const config = require('../config.json');

const curConfigEnv = config[process.env.NODE_ENV];
const connection = mongoose.createConnection(curConfigEnv.mongodb.uri, curConfigEnv.mongodb.option);

mongoose.set('useCreateIndex', true);

Promise.promisifyAll(connection);
connection.Promise = Promise;

connection
  .once('open', async () => {
    const { version } = await connection.db.admin().serverInfo();
    console.info(`connection open : ${curConfigEnv.mongodb.uri} , MongoDB version ${version}`);
  })
  .catch(console.error);



const accountSchema = require('./schema/account');
const websiteSchema = require('./schema/website');
const commentSchema = require('./schema/comment');
const subscribeSchema = require('./schema/subscribe');
const gradeSchema = require('./schema/grade');

require('./statics/account')(accountSchema);
require('./statics/website')(websiteSchema);
require('./statics/comment')(commentSchema);
require('./statics/subscribe')(subscribeSchema);
require('./statics/grade')(gradeSchema);

module.exports = {
    account: connection.model('account', accountSchema),
    website: connection.model('website', websiteSchema),
    comment: connection.model('comment', commentSchema),
    subscribe: connection.model('subscribe', subscribeSchema),
    grade: connection.model('grade', gradeSchema)
};