require('dotenv').config()

module.exports = {
  BDD_PASSWORD: process.env.BDD_PASSWORD,
  DOMAINE_FRONT: process.env.DOMAINE_FRONT,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  PERSONNAL_EMAIL: process.env.PERSONNAL_EMAIL,
}
