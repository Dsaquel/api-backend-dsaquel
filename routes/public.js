const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/public')

//home
router.get('/topManga', userCtrl.topManga)
router.get('/animeUpComing', userCtrl.animeUpComing)
router.get('/topCharacters', userCtrl.topCharacters)

//manga
router.get('/pickManga', userCtrl.pickManga)
router.get('/manga/:id', userCtrl.manga)
router.get('/mangaFiltered', userCtrl.mangaFiltered)
router.get('/mostFavoritesManga', userCtrl.mostFavoritesManga)
router.get('/:id/recommendations', userCtrl.mangaRecommendations)

//anime
router.get('/anime/:id', userCtrl.anime)
router.get('/animeFiltered', userCtrl.animeFiltered)
router.get('/animeSeasonNow', userCtrl.animeSeasonNow)
router.get('/topReviewsAnime', userCtrl.topReviewsAnime)

// character
router.get('/character/:id', userCtrl.getCharacter)

// mail
router.post('/sendMessage', userCtrl.sendMessage)

module.exports = router
