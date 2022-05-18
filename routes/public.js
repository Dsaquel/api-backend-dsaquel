const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/public')

//home
router.get('/topManga', userCtrl.topManga)
router.get('/animeUpComing', userCtrl.animeUpComing)
router.get('/topCharacters', userCtrl.topCharacters)

//manga
router.get('/getManga/:id', userCtrl.getManga)
router.get('/mostFavoritesManga', userCtrl.mostFavoritesManga)
router.get('/pickManga', userCtrl.pickManga)
router.get('/:id/recommendations', userCtrl.mangaRecommendations)
router.get('/mangaFiltered', userCtrl.mangaFiltered)

//anime
router.get('/getAnime/:id', userCtrl.getAnime)
router.get('/topReviewsAnime', userCtrl.topReviewsAnime)
router.get('/animeSeasonNow', userCtrl.animeSeasonNow)
router.get('/animeFiltered', userCtrl.animeFiltered)

// character
router.get('/character/:id', userCtrl.getCharacter)

// mail
router.post('/sendMessage', userCtrl.sendMessage)

module.exports = router
