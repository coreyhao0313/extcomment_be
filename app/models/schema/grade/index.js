const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports =  new Schema({
    tid:  {
      type: Schema.Types.ObjectId,
      index: true,
      required: true
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: 'account',
      required: true
    },
    kind:  {
      type: String,
      enum: ['comment.normal', 'comment.reply', 'website.host', 'website.path'],
      required: true,
      default: 'website.host'
    },
    liking: {
        type: Number,
        enum: [1, -1],
        default: 1
    },
});