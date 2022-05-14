const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/user')

router.post('/signup', userCtrl.signup)
router.post('/login', userCtrl.login)
router.get('/confirmation/:email/:token', userCtrl.confirmEmail)
router.post('/resendLink', userCtrl.resendLink)
router.post('/linkPasswordReset', userCtrl.linkPasswordReset)
router.put('/resetPassword', userCtrl.resetPassword)
router.get('/userProfile/:token', userCtrl.userProfile)
router.put('/editUserProfile', userCtrl.editUserProfile)
router.put('/deleteAccount', userCtrl.deleteAccount)
router.put('/recupAccountByPassword', userCtrl.recupAccountByPassword)
router.put('/recupAccountByBtn', userCtrl.recupAccountByBtn)

module.exports = router
