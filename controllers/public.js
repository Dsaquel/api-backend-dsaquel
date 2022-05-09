const { parse } = require('dotenv')
const Jikan = require('jikan4.js')
const client = new Jikan.Client()
const ExpireMonth = require('../models/ExpireMonth')

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

exports.pickMangas = (req, res, next) => {
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

exports.pagination = async (req, res, next) => {
  const toto = await client.anime.search('anime', 1, {limit: 1})
  res.send(toto)
}

exports.animeFiltered = async (req, res, next) => {
  const title = (req.query.type) ? req.query.type : ''
  const type = (req.query.type) ? req.query.type : undefined
  const genres = (req.query.genres) ? [parseInt(req.query.genres)] : undefined
  const orderBy = (req.query.orderBy) ? req.query.orderBy : undefined
  const status = (req.query.status) ? req.query.status : undefined

  const filter = Object.assign(
    {}, (type !== undefined) && { type },
        (genres !== undefined) && {genres},
        (orderBy !== undefined) && {orderBy},
        (status !== undefined) && {status},
    );
  const animeFiltered = await client.anime.search(title, filter, 1)
  res.send(animeFiltered)
}
