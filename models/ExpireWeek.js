const mongoose = require('mongoose')
const expireSchema = mongoose.Schema({
    idStuff: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Library',
      },
      createdAt: { type: Date, expires: '10080m', default: Date.now },
})

module.exports = mongoose.model('ExpireWeek', expireSchema)
