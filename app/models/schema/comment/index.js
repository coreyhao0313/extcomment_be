const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports =  new Schema({
    tid:  {
      type: Schema.Types.ObjectId,
      index: true,
      required: false
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: 'account',
      default: null
    },
    kind:  {
      type: String,
      enum: ['normal', 'reply'],
      required: true,
      default: 'normal'
    },
    content: {
      type: String,
      required: true,
      default: ''
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