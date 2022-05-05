const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/stuff')

router.post('/insertStuff', userCtrl.insertStuff)
router.get('/getUserStuff/:token', userCtrl.getUserStuff)
router.delete('/deleteUserStuff/:token', userCtrl.deleteUserStuff)

router.get('/getManga/:id', userCtrl.getManga)
router.get('/getAnime/:id', userCtrl.getAnime)

module.exports = router