const axios = require('axios').default
const Jikan = require('jikan4.js')
const client = new Jikan.Client()
const nodemailer = require('nodemailer')
const baseUrl = 'https://api.jikan.moe/v4'
const ExpireMonth = require('../models/ExpireMonth')
//TODO: delete ?
// const episodeAnime = require('anime-vostfr')
// const getVideoFromIframe = require('iframe-to-video')
// const fetch = require('node-fetch')

exports.getManga = async (req, res) => {
  const manga = await client.manga.get(parseInt(req.params.id))
  return res.status(200).send(manga)
}

exports.getAnime = async (req, res) => {
  const anime = await client.anime.get(parseInt(req.params.id))
  return res.status(200).send(anime)
}

exports.topManga = (req, res) => {
  ExpireMonth.findOne({ name: 'topManga' }).then(async (data) => {
    if (!data) {
      const data = JSON.stringify(await client.top.listManga())
      new ExpireMonth({
        name: 'topManga',
        data,
      })
        .save()
        .then(res.status(200).send(data))
    } else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.animeUpComing = (req, res) => {
  ExpireMonth.findOne({ name: 'animeUpComing' }).then(async (data) => {
    if (!data) {
      const data = JSON.stringify(await client.seasons.getUpcoming())
      new ExpireMonth({
        name: 'animeUpComing',
        data,
      })
        .save()
        .then(res.status(200).send(data))
    } else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.topCharacters = (req, res) => {
  ExpireMonth.findOne({ name: 'topCharacters' }).then(async (data) => {
    if (!data) {
      const data = JSON.stringify(await client.top.listCharacters())
      new ExpireMonth({
        name: 'topCharacters',
        data,
      })
        .save()
        .then(res.status(200).send(data))
    } else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.mostFavoritesManga = (req, res) => {
  ExpireMonth.findOne({ name: 'mostFavoritesManga' }).then(async (data) => {
    if (!data) {
      const data = JSON.stringify(
        await client.manga.listTop({
          filter: 'favorite',
          type: 'manga',
        })
      )
      new ExpireMonth({
        name: 'mostFavoritesManga',
        data,
      })
        .save()
        .then(res.status(200).send(data))
    } else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.topReviewsAnime = (req, res) => {
  ExpireMonth.findOne({ name: 'topReviewsAnime' }).then(async (data) => {
    if (!data) {
      const data = JSON.stringify(await client.top.listReviews())
      new ExpireMonth({
        name: 'topReviewsAnime',
        data,
      })
        .save()
        .then(res.status(200).send(data))
    } else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.animeSeasonNow = async (req, res) => {
  ExpireMonth.findOne({ name: 'animeSeasonNow' }).then(async (data) => {
    if (!data) {
      const data = JSON.stringify(await client.seasons.getNow())
      new ExpireMonth({
        name: 'animeSeasonNow',
        data,
      })
        .save()
        .then(res.status(200).send(data))
    } else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.pickManga = (req, res) => {
  ExpireMonth.findOne({ name: 'pickMangas' }).then(async (data) => {
    if (!data) {
      const allData = await client.manga.list()
      const data = JSON.stringify(
        allData.sort(() => Math.random() - Math.random()).slice(0, 9)
      )
      new ExpireMonth({
        name: 'pickMangas',
        data,
      })
        .save()
        .then(res.status(200).send(data))
    } else {
      return res.status(200).send(JSON.parse(data.data))
    }
  })
}

exports.animeFiltered = async (req, res) => {
  const query = req._parsedUrl.search
  axios
    .get(`${baseUrl}/anime${query}`)
    .then((responseApi) => res.send(responseApi?.data))
    .catch((error) => console.log(error))
}

exports.mangaFiltered = async (req, res) => {
  const query = req._parsedUrl.search
  axios
    .get(`${baseUrl}/manga${query}`)
    .then((responseApi) => res.send(responseApi?.data))
    .catch((error) => console.log(error))
}

exports.getCharacter = async (req, res) => {
  const character = await client.characters.get(parseInt(req.params.id))
  return res.status(200).send(character)
}

exports.mangaRecommendations = async (req, res) => {
  axios
    .get(`${baseUrl}/manga/${parseInt(req.params.id)}/recommendations`)
    .then((responseApi) => res.send(responseApi?.data))
    .catch((error) => console.log(error))
}

exports.sendMessage = (req, res) => {
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
    text: req.body.message,
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    return res.json({ message: 'message sent' })
  })
}
