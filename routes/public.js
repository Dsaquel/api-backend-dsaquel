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

router.get('/pagination', userCtrl.pagination)
router.get('/animeFiltered', userCtrl.animeFiltered)

module.exports = router;