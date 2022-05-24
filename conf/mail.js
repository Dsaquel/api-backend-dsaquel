const nodemailer = require('nodemailer')
const env = require('./env')

module.exports = nodemailer.createTransport({
  name: 'dsaquel.com',
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL_USERNAME,
    pass: env.EMAIL_PASSWORD,
  },
  from: env.EMAIL_USERNAME,
})
