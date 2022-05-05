const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/public')

//home
router.get('/topManga', userCtrl.topManga)
router.get('/animeUpComing', userCtrl.animeUpComing)
router.get('/topCharacters', userCtrl.topCharacters)

//manga
router.get('/mostFavoritesManga', userCtrl.mostFavoritesManga)
router.get('/pickMangas', userCtrl.pickMangas)

//anime
router.get('/topReviewsAnime', userCtrl.topReviewsAnime)
router.get('/animeSeasonNow', userCtrl.animeSeasonNow)

module.exports = router;