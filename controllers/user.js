const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const Token = require('../models/Token')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const jwt_decode = require('jwt-decode')
require('dotenv').config()

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      User.findOne({ email: req.body.email })
        .then(async (userExist) => {
          if (!userExist) {
            const newUser = new User({
              email: req.body.email,
              password: hash,
              pseudo: req.body.pseudo,
              isVerified: false,
            })
            newUser.save(function () {
              const token = new Token({
                _userId: newUser._id,
                token: crypto.randomBytes(16).toString('hex'),
              })
              token.save(function (err) {
                if (err) {
                  return res.status(500).send({
                    error: err.message,
                  })
                }

                const transporter = nodemailer.createTransport({
                  name: 'dsaquel.com',
                  host: 'ssl0.ovh.net',
                  port: 465,
                  secure: true,
                  auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                  },
                  from: process.env.EMAIL_USERNAME,
                })
                const mailOptions = {
                  from: process.env.EMAIL_USERNAME,
                  to: req.body.email,
                  subject: 'Account Verification link',
                  text:
                    'Hello' +
                    req.body.pseudo +
                    ',\n\n' +
                    'Please verify your account by clicking the link: \nhttp://' +
                    process.env.DOMAINE_FRONT +
                    '/confirmation/' +
                    req.body.email +
                    '/' +
                    token.token +
                    '\n\nThank You!\n',
                }
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    return console.log(error)
                  }
                  return res.json({ message: 'Email confirmaiton send' })
                })
              })
            })
          } else {
            const passwordCompare = await bcrypt.compare(
              req.body.password,
              userExist.password
            )
            if (passwordCompare)
              return res
                .status(400)
                .send({ valid: true, email: req.body.email })
            if (!passwordCompare && userExist.desactivate_user === 1)
              return res
                .status(400)
                .send({ error: true, password: true, email: req.body.email })
            if (userExist)
              return res.status(400).send({ error: 'email already used' })
            return res.status(404).send({ error: 'Not found' })
          }
        })
        .catch((error) => console.log(error))
    })
    .catch((error) =>
      res.status(500).json({
        error,
      })
    )
}

exports.login = (req, res, next) => {
  User.findOne({
    email: req.body.email,
  })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: 'Utilisateur non trouvé !',
        })
      }
      bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid && user.desactivate_user === 1) {
          return res.status(400).send({
            error: true,
            password: true,
            email: req.body.email,
          })
        } else if (valid && user.desactivate_user === 1) {
          return res.status(400).send({
            valid,
            email: req.body.email,
          })
        } else if (!valid) {
          return res.status(400).json({
            error: 'Mot de passe incorrect !',
          })
        } else if (!user.isVerified) {
          return res.status(400).send({
            error: 'Your Email has not been verified. Please click on resend',
          })
        }

        res.status(200).json({
          token: jwt.sign(
            {
              email: user.email,
              pseudo: user.pseudo,
              userId: user._id,
            },
            'RANDOM_TOKEN_SECRET',
            {
              expiresIn: '24h',
            }
          ),
        })
      })
    })
    .catch((error) =>
      res.status(500).json({
        error,
      })
    )
}

exports.confirmEmail = (req, res, next) => {
  Token.findOne({
    token: req.params.token,
  }).then((token) => {
    if (!token) {
      return res.status(400).send({
        error:
          'Your verification link may have expired. Please click on resend for verify your Email.',
      })
    } else {
      User.findOne({
        _is: token._userId,
        email: req.params.email,
      }).then(async (user) => {
        if (!user) {
          return res.status(401).send({
            error:
              'We were unable to find a user for this verification. Please SignUp!',
          })
        } else if (user.isVerified) {
          return res.status(200).send({
            message: 'User has been already verified. Please Login',
          })
        } else {
          user.isVerified = true
          await user
            .save({
              validateModifiedOnly: true,
            })
            .then(
              res.status(201).json({
                message: 'Your account has been successfuly verified',
              })
            )
        }
      })
    }
  })
}

exports.resendLink = (req, res, next) => {
  User.findOne({
    email: req.body.email,
  }).then((user) => {
    if (!user) {
      return res.status(400).send({
        error:
          'We were unable to find a user with that email. Make sure your Email is correct!',
      })
    } else if (user.isVerified) {
      return res.status(403).json({
        error: 'This account has been already verified. Please log in.',
      })
    } else {
      const token = new Token({
        _userId: user._id,
        token: crypto.randomBytes(16).toString('hex'),
      })
      token.save(function (err) {
        if (err) {
          return res.status(500).send({
            message: err.message,
          })
        }
        const transporter = nodemailer.createTransport({
          name: 'dsaquel.com',
          host: 'ssl0.ovh.net',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
          from: process.env.EMAIL_USERNAME,
        })
        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: user.email,
          subject: 'Account Verification link',
          text:
            'Hello' +
            req.body.pseudo +
            ',\n\n' +
            'Please verify your account by clicking the link: \nhttp://' +
            process.env.DOMAINE_FRONT +
            '/confirmation/' +
            user.email +
            '/' +
            token.token +
            '\n\nThank You!\n',
        }
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error)
          }
          return res.json({ message: 'Email confirmaiton resend now' })
        })
      })
    }
  })
}

exports.linkPasswordReset = (req, res, next) => {
  User.findOne({
    email: req.body.email,
  }).then((user) => {
    if (!user) {
      return res.status(404).send({
        error: "User doesn't exist",
      })
    }
    const token = new Token({
      _userId: user.id,
      token: crypto.randomBytes(16).toString('hex'),
    })

    token.save(function (err) {
      if (err) {
        return res.status(500).send({
          error: err.message,
        })
      }
      const transporter = nodemailer.createTransport({
        name: 'dsaquel.com',
        host: 'ssl0.ovh.net',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
        from: process.env.EMAIL_USERNAME,
      })
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: 'Password reset Dsaquel',
        text:
          'Hello ' +
          user.pseudo +
          ',\n\n' +
          'Click on this link for reset your password: \nhttp://' +
          process.env.DOMAINE_FRONT +
          '/reset-password/' +
          user.email +
          '/' +
          token.token +
          '\n\nThank You!\n',
      }
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error)
        }
        return res.status(200).json({ message: 'mail sent' })
      })
    })
  })
}

exports.resetPassword = (req, res, next) => {
  Token.findOne({ userId: req.body.token }).then(async (token) => {
    if (!token) return res.status(400).send({ error: 'token expire' })
    const hash = await bcrypt.hash(req.body.password, 10)
    User.updateOne(
      { _id: token._userId },
      { $set: { password: hash } },
      function (err) {
        if (err)
          return res.status(500).send({ error: 'error, please try again' })
        return res.status(200).send({ message: 'password updated successfuly' })
      }
    )
  })
}

exports.userProfile = (req, res, next) => {
  const token = req.params.token
  if (token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'must be connected' })
  }
  const dataToken = jwt_decode(token)
  User.findOne({ _id: dataToken.userId }).then((user) => {
    if (!user) {
      return res.status(404).json({ error: 'User not found, please try again' })
    }
    return res.status(200).json({ pseudo: user.pseudo, email: user.email })
  })
}

exports.editUserProfile = (req, res, next) => {
  const token = req.body.token
  if (token === null || token === undefined) {
    return res.status(401).json({ message: 'must be connected' })
  }
  const dataToken = jwt_decode(token)
  User.updateOne(
    { _id: dataToken.userId },
    {
      $set: {
        ...req.body,
      },
    },
    function (err) {
      if (err)
        return res
          .status(401)
          .json({ error: 'error with editing, please try again' })
      return res.status(200).json({ message: 'Edited' })
    }
  )
}

exports.deleteAccount = (req, res, next) => {
  if (!req.body.token || !req.body.email)
    return res.send({ error: 'please login for delete your account' })
  const dataToken = jwt_decode(req.body.token)
  User.updateOne(
    { _id: dataToken.userId, email: req.body.email },
    {
      $set: {
        desactivate_user: 1,
      },
    },
    function (err) {
      if (err)
        return res
          .status(401)
          .json({ error: 'error with delete, please try again' })
      return res.status(200).json({ message: 'account deleted' })
    }
  )
}

exports.recupAccountByPassword = (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).send({ error: 'Cannot user whithout data' })
  User.findOne({
    email: req.body.email,
  }).then(async (user) => {
    if (!user) {
      return res.status(400).json({
        error: 'user not found !',
      })
    }
    const comparePassword = await bcrypt.compare(
      req.body.password,
      user.password
    )
    if (!comparePassword)
      return res
        .status(400)
        .send({ error: 'Password not equal', passwordNotEqual: true })
    user.desactivate_user = null
    user.save({ validateModifiedOnly: true })
    res.status(200).json({
      token: jwt.sign(
        {
          email: user.email,
          pseudo: user.pseudo,
          userId: user.id,
        },
        'RANDOM_TOKEN_SECRET',
        {
          expiresIn: '24h',
        }
      ),
    })
  })
}

exports.recupAccountByBtn = async (req, res, next) => {
  if (!req.body.email)
    return res.status(400).send({ error: 'Cannot user whithout data' })
  const user = await User.findOne({ email: req.body.email })
  user.desactivate_user = null
  user.save({ validateModifiedOnly: true })
  res.status(200).json({
    token: jwt.sign(
      {
        email: user.email,
        pseudo: user.pseudo,
        userId: user._id,
      },
      'RANDOM_TOKEN_SECRET',
      {
        expiresIn: '24h',
      }
    ),
  })
}
