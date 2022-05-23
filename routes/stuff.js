const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/stuff')

//library user
router.post('/insertStuff', userCtrl.insertStuff)
router.get('/getUserStuff/:token', userCtrl.getUserStuff)
router.delete('/deleteUserStuff', userCtrl.deleteUserStuff)

module.exports = router
