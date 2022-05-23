const Jikan = require('jikan4.js')
const client = new Jikan.Client()
const axios = require('axios').default
const baseUrl = 'https://api.jikan.moe/v4'
const transporter = require('../conf/mail')
const ExpireMonth = require('../models/ExpireMonth')

exports.manga = async (req, res) => {
  const manga = await client.manga.get(parseInt(req.params.id))
  return res.status(200).send(manga)
}

exports.anime = async (req, res) => {
  const anime = await client.anime.get(parseInt(req.params.id))
  return res.status(200).send(anime)
}

exports.topManga = async (req, res) => {
  const data = await ExpireMonth.findOne({ name: 'topManga' })
  if (!data) {
    const data = JSON.stringify(await client.top.listManga())
    new ExpireMonth({
      name: 'topManga',
      data,
    }).save()
    res.status(200).send(data)
  } else {
    res.status(200).send(JSON.parse(data.data))
  }
}

exports.animeUpComing = async (req, res) => {
  const data = await ExpireMonth.findOne({ name: 'animeUpComing' })
  if (!data) {
    const data = JSON.stringify(await client.seasons.getUpcoming())
    new ExpireMonth({
      name: 'animeUpComing',
      data,
    }).save()
    res.status(200).send(data)
  } else {
    res.status(200).send(JSON.parse(data.data))
  }
}

exports.topCharacters = async (req, res) => {
  const data = await ExpireMonth.findOne({ name: 'topCharacters' })
  if (!data) {
    const data = JSON.stringify(await client.top.listCharacters())
    new ExpireMonth({
      name: 'topCharacters',
      data,
    }).save()
    res.status(200).send(data)
  } else {
    res.status(200).send(JSON.parse(data.data))
  }
}

exports.mostFavoritesManga = async (req, res) => {
  const data = await ExpireMonth.findOne({ name: 'mostFavoritesManga' })
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
    }).save()
    res.status(200).send(data)
  } else {
    res.status(200).send(JSON.parse(data.data))
  }
}

exports.topReviewsAnime = async (req, res) => {
  const data = await ExpireMonth.findOne({ name: 'topReviewsAnime' })
  if (!data) {
    const data = JSON.stringify(await client.top.listReviews())
    new ExpireMonth({
      name: 'topReviewsAnime',
      data,
    }).save()
    res.status(200).send(data)
  } else {
    res.status(200).send(JSON.parse(data.data))
  }
}

exports.animeSeasonNow = async (req, res) => {
  const data = await ExpireMonth.findOne({ name: 'animeSeasonNow' })
  if (!data) {
    const data = JSON.stringify(await client.seasons.getNow())
    new ExpireMonth({
      name: 'animeSeasonNow',
      data,
    }).save()
    res.status(200).send(data)
  } else {
    res.status(200).send(JSON.parse(data.data))
  }
}

exports.pickManga = async (req, res) => {
  const data = await ExpireMonth.findOne({ name: 'pickMangas' })
  if (!data) {
    const allData = await client.manga.list()
    const data = JSON.stringify(
      allData.sort(() => Math.random() - Math.random()).slice(0, 9)
    )
    new ExpireMonth({
      name: 'pickMangas',
      data,
    }).save()
    res.status(200).send(data)
  } else {
    res.status(200).send(JSON.parse(data.data))
  }
}

exports.animeFiltered = async (req, res) => {
  const query = req._parsedUrl.search
  const responseApi = await axios.get(`${baseUrl}/anime${query}`)
  res.send(responseApi?.data)
}

exports.mangaFiltered = async (req, res) => {
  const query = req._parsedUrl.search
  const responseApi = await axios.get(`${baseUrl}/manga${query}`)
  res.send(responseApi?.data)
}

exports.getCharacter = async (req, res) => {
  const character = await client.characters.get(parseInt(req.params.id))
  return res.status(200).send(character)
}

exports.mangaRecommendations = async (req, res) => {
  const responseApi = await axios.get(
    `${baseUrl}/manga/${parseInt(req.params.id)}/recommendations`
  )
  res.send(responseApi?.data)
}

exports.sendMessage = (req, res) => {
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
