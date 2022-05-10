const axios = require('axios').default
const Jikan = require('jikan4.js')
const client = new Jikan.Client()
const nodemailer = require('nodemailer')
const baseUrl = 'https://api.jikan.moe/v4'
const ExpireMonth = require('../models/ExpireMonth')


exports.getManga = async (req, res, next) => {
  const manga = await client.manga.get(parseInt(req.params.id))
  return res.status(200).send(manga)
}

exports.getAnime = async (req, res, next) => {
  const anime = await client.anime.get(parseInt(req.params.id))
  return res.status(200).send(anime)
}

exports.topManga = (req, res ,next) => {
    ExpireMonth.findOne({name: 'topManga'})
    .then(async data => {
      if(!data) {
        const data = JSON.stringify(await client.top.listManga())
        const topManga = new ExpireMonth({
          name: 'topManga',
          data
        }).save()
            .then(res.status(200).send(data))
      }
      else {
        return res.status(200).send(JSON.parse(data.data))
      }
    })
  }
  
exports.animeUpComing = (req, res, next) => {
    ExpireMonth.findOne({name: 'animeUpComing'})
    .then(async data => {
      if(!data) {
        const data = JSON.stringify(await client.seasons.getUpcoming())
        const animeUpComing = new ExpireMonth({
          name: 'animeUpComing',
          data
        }).save()
            .then(res.status(200).send(data))
      }
      else {
        return res.status(200).send(JSON.parse(data.data))
      }
    })
}

exports.topCharacters = (req ,res , next) => {
  ExpireMonth.findOne({name: 'topCharacters'})
  .then(async data => {
    if(!data) {
      const data = JSON.stringify(await client.top.listCharacters())
      const topCharacters = new ExpireMonth({
        name: 'topCharacters',
        data
      }).save()
          .then(res.status(200).send(data))
    }
    else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.mostFavoritesManga = (req, res, next) => {
  ExpireMonth.findOne({name: 'mostFavoritesManga'})
  .then(async data => {
    if(!data) {
      const data = JSON.stringify(await client.manga.listTop({
        filter: 'favorite',
        type: 'manga'
    }))
      const mostFavoritesManga = new ExpireMonth({
        name: 'mostFavoritesManga',
        data
      }).save()
          .then(res.status(200).send(data))
    }
    else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.topReviewsAnime = (req, res, next) => {
  ExpireMonth.findOne({name: 'topReviewsAnime'})
  .then(async data => {
    if(!data) {
      const data = JSON.stringify(await client.top.listReviews())
      const topReviewsAnime = new ExpireMonth({
        name: 'topReviewsAnime',
        data
      }).save()
          .then(res.status(200).send(data))
    }
    else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.animeSeasonNow = async (req, res, next) => {
  ExpireMonth.findOne({name: 'animeSeasonNow'})
  .then(async data => {
    if(!data) {
      const data = JSON.stringify(await client.seasons.getNow())
      const animeSeasonNow = new ExpireMonth({
        name: 'animeSeasonNow',
        data
      }).save()
          .then(res.status(200).send(data))
    }
    else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.pickManga = (req, res, next) => {
  ExpireMonth.findOne({name: 'pickMangas'})
  .then(async data => {
    if(!data) {
      const allData = (await client.manga.list())
      const data = JSON.stringify(allData.sort(() => Math.random() - Math.random()).slice(0, 9))
      const pickMangas = new ExpireMonth({
        name: 'pickMangas',
        data
      }).save()
          .then(res.status(200).send(data))
    }
    else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.animeFiltered = async (req, res, next) => {
  const query = req._parsedUrl.search
  axios.get(`${baseUrl}/anime${query}`)
    .then(responseApi => res.send(responseApi?.data))
    .catch(error => console.log(error))
}

exports.mangaFiltered = async (req, res, next) => {
  const query = req._parsedUrl.search
  axios.get(`${baseUrl}/manga${query}`)
    .then(responseApi => res.send(responseApi?.data))
    .catch(error => console.log(error))
}

exports.getCharacter = async (req, res, next) => {
  const character = await client.characters.get(parseInt(req.params.id))
  return res.status(200).send(character)
}

exports.mangaRecommendations = async (req, res, next) => {
  axios.get(`${baseUrl}/manga/${parseInt(req.params.id)}/recommendations`)
    .then(responseApi => res.send(responseApi?.data))
    .catch(error => console.log(error))
}

exports.sendMessage = (req, res, next) => {
  const transporter = nodemailer.createTransport({
    name: 'dsaquel.com',
    host: 'ssl0.ovh.net',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: process.env.PERSONNAL_EMAIL,
    subject: 'Message de ' + req.body.name,
    text: req.body.message
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    return res.json({message: 'message sent'})
  })
}