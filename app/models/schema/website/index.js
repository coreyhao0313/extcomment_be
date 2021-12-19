const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports =  new Schema({
  tid:  {
    type: Schema.Types.ObjectId,
    ref: 'website'
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    default: null
  },
  kind:  {
    type: String,
    enum: ['host', 'path'],
    required: true,
    default: 'host'
  },
  name: {
    unique: true,
    type: String,
    index: true,
    required: true,
    default: ''
  },
  locks: {
    type: [String],
    enum: ['ref.origin', 'grade.read', 'grade.good.read', 'grade.bad.read', 'grade.write', 'comment.read', 'comment.write']
  },
  note: {
    type: String,
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