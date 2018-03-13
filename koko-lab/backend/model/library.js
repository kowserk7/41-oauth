'use strict';

const mongoose = require('mongoose');
const Library = mongoose.Schema({
  name: { type: String, required: true},
  description: { type: String,required: true},
  userId:{ type: mongoose.Schema.Types.ObjectId, required: true, ref:'user'},
});

module.exports = mongoose.model('library', Library);