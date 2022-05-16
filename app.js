const express = require('express')
const mongoose = require('mongoose')
const app = express()
const publicRoutes = require('./routes/public')
const stuffRoutes = require('./routes/stuff')
const userRoutes = require('./routes/user')
require('dotenv').config()
const compression = require('compression')

mongoose
  .connect(
    `mongodb+srv://Dsaquel:${process.env.BDD_PASSWORD}@cluster0.h7ena.mongodb.net/Dsaquel`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  )
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  )
  next()
})

app.use(express.json())
app.use(compression())
app.use('/api/public', publicRoutes)
app.use('/api/stuff', stuffRoutes)
app.use('/api/auth', userRoutes)
module.exports = app
