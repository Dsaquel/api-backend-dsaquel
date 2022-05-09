const fs = require('fs')
const Jikan = require('jikan4.js')
const client = new Jikan.Client()
const Library = require('../models/Library')
const ExpireWeek = require('../models/ExpireWeek')
const jwt_decode = require('jwt-decode')

exports.insertStuff = async (req, res, next) => {
  const token = req.body.token
  if(token === null)return res.status(401).json({error: 'must be connected'})
  const dataToken = await jwt_decode(token)
    Library.findOne({
      _userId: dataToken.userId,
      id: req.body.id,
      type: req.body.type
    })
    .then((stuff) => {
      if (!stuff) {
            const newStuff = new Library({
              _userId: dataToken.userId,
              id: req.body.id,
              data: JSON.stringify(req.body.stuff),
              type: req.body.type
            })
            newStuff.save(function () {
              const expire = new ExpireWeek({
                idStuff: newStuff._id,
              }).save().then(res.status(201).json({ message: `${req.body.type} insered` }))
            })
          }
          else {
            ExpireWeek.findOne({idStuff: stuff._id})
            .then(expire => { 
              if(!expire) {
                const newStuff = new Library({
                  _userId: dataToken.userId,
                  id: req.body.id,
                  data: JSON.stringify(req.body.stuff),
                  type: req.body.type
                })
              newStuff.save(function () {
                const expire = new ExpireWeek({
                  idStuff: stuff._id,
                }).save().then(res.status(201).json({ message: `${req.body.type} insered` }))
              })
                } else {
                  return res.status(200).json({message: `${req.body.type} already insered`})
                }
              })
          }
        })
      
}

exports.getUserStuff = async (req, res, next) => {
  const token = req.params.token
  if(token === 'null' || token === 'undefined') {
    return res.status(401).json({error: 'must be connected'})
  } else {
    const dataToken = jwt_decode(token)
    Library.find({_userId: dataToken.userId})
    .then(data => {
      data.forEach(stuff => {
          ExpireWeek.findOne({idStuff: stuff._id})
          .then(async expire => {
            if(!expire) {
              const id = JSON.parse(stuff.data).id
              if(stuff.type === 'anime') {
                const anime = await client.anime.get(id)
                stuff.data = JSON.stringify(anime)
                stuff.save({validateModifiedOnly: true}, function() {
                  const expire = new ExpireWeek({
                    idStuff: stuff._id,
                  }).save()
                })
              }
              if (stuff.type === 'manga') {
                const manga = await client.manga.get(id)
                stuff.data = JSON.stringify(manga)
                stuff.save({validateModifiedOnly: true}, function(){
                  const expire = new ExpireWeek({
                    idStuff: stuff._id,
                  }).save()
                })
              }
            }
          })
      })
      return res.status(200).send(data)
    })
  }
}

exports.deleteUserStuff = async (req, res, next) => {
  const token = req.body.token
  if(token === null || token === undefined) {
    return res.status(401).json({error: 'must be connected'})
  }
  else if(req.body._id === null) {
    return res.status(404).json({error: 'no id stuff'})
  }
   else {
    const dataToken = await jwt_decode(token)
    Library.deleteOne({_userId: dataToken.userId, _id: req.body._id})
      .then(() => {
        ExpireWeek.deleteOne({idStuff:  req.body._id})
        Library.find({_userId: dataToken.userId})
        .then(data => {
          if(data) {
            return res.status(200).send(data)
          }
        })
      })
      .catch(error => console.log(error))
  }
}

exports.getManga = async (req, res, next) => {
  const manga = await client.manga.get(parseInt(req.params.id))
  return res.status(200).send(manga)
}

exports.getAnime = async (req, res, next) => {
  const anime = await client.anime.get(parseInt(req.params.id))
  return res.status(200).send(anime)
}



