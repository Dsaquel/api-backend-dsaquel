const nodemailer = require('nodemailer')
require('dotenv').config()

module.exports = nodemailer.createTransport({
  name: 'dsaquel.com',
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  from: process.env.EMAIL_USERNAME,
})

