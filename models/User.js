const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  password: { type: String, required: true },
  pseudo: { type: String, required: true, unique: true },
  desactivate_user: {type: Number, default: null }
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)
