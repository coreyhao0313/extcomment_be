const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports =  new Schema({
  email:  {
    unique: true,
    type: String,
    index: true,
    required: true 
  },
  avatar: {
    type: String,
    default: ''
  },
  pfid: {
    unique: true,
    type: String,
    index: true,
    required: true 
  },
  rules: {
    type: [String],
    enum: ['normal', 'admin'],
    required: true,
    default: ['normal']
  },
  name: {
    type: String,
    default: ''
  },
  nick: {
    type: String,
    default: ''
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