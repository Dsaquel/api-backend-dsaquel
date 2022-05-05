const mongoose = require('mongoose')

const librarySchema = new mongoose.Schema({
  _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  id: {type: Number, required: true},
  data: [{ type: Object, required: true }],
  type: {type: String, required: true}
})

module.exports = mongoose.model('Library', librarySchema)
