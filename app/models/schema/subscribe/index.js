const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports =  new Schema({
    wid:  {
      type: Schema.Types.ObjectId,
      required: false
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: 'account'
    },
    kind:  {
      type: String,
      enum: ['comment', 'grade', 'event', 'tag'],
      required: true,
      default: 'grade'
    },
    inid:  {
      type: Schema.Types.ObjectId,
      required: true
    },
    aid:  {
      type: Schema.Types.ObjectId,
      required: true
    },
    read: {
      type: Number,
      default: null,
    },
    status: {
      created: {
        type: Number,
        default: Date.now,
      },
      updated: {
        type: Number,
        default: Date.now,
      },
      deleted: {
        type: Number,
        default: null,
      },
    }
  });