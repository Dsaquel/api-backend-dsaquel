const mongoose = require('mongoose')
const expireSchema = mongoose.Schema({
  name: { type: String, required: true },
  data: { type: Array, required: true },
  createdAt: { type: Date, expires: '43800m', default: Date.now },
})

module.exports = mongoose.model('ExpireMonth', expireSchema)
