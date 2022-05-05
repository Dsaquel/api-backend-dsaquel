const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const Token = require('../models/Token')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const jwt_decode = require('jwt-decode')
require('dotenv').config();

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
        pseudo: req.body.pseudo,
        isVerified: false,
      })
      user.save(function () {
        const token = new Token({
          _userId: user._id,
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
            from: process.env.EMAIL_USERNAME
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
            return res.json({message: 'Email confirmaiton send'})
          })
        })
      })
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
        return res.status(401).json({
          error: 'Utilisateur non trouvé !',
        })
      }
      bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid) {
          return res.status(401).json({
            error: 'Mot de passe incorrect !',
          })
        } else if (!user.isVerified) {
          return res.status(401).send({
            error: 'Your Email has not been verified. Please click on resend',
          })
        }
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
        message:
          'Your verification link may have expired. Please click on resend for verify your Email.',
      })
    } else {
      User.findOne({
        _is: token._userId,
        email: req.params.email,
      }).then(async user => {
        if (!user) {
          return res.status(401).send({
            message:
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
      return res
        .status(403)
        .json({error: 'This account has been already verified. Please log in.'})
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
          from: process.env.EMAIL_USERNAME
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
          return res.json({message: 'Email confirmaiton resend now'})
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
      return res.status(500).send({
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
        from: process.env.EMAIL_USERNAME
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
        return res.status(200).json({message: 'mail sent'})
      })
    })
  })
}

exports.resetPassword = (req, res, next) => {
  Token.findOne({ userId: req.token }).then(async (token) => {
    if (!token) return res.status(500).send({ message: 'token expire' })
    const hash = await bcrypt.hash(req.body.password, 10)
    User.updateOne(
      { _id: token._userId },
      { $set: { password: hash } },
      function (err) {
        if (err) return res.status(500).send({ error: 'error, please try again' })
        return res
          .status(200)
          .send({ message: 'password updated successfuly' })
      }
    )
  })
}

exports.userProfile = (req, res, next) => {
  const token = req.params.token
  if(token === 'null' || token === 'undefined') {
    return res.status(401).json({error: 'must be connected'})
  }
  const dataToken = jwt_decode(token)
  User.findOne({_id: dataToken.userId})
  .then(user => {
    if(!user) {
      return res.status(404).json({error: 'User not found, please try again'})
    }
    return res.status(200).json({pseudo: user.pseudo, email: user.email})
  })
}

exports.editUserProfile = (req, res, next) => {
  const token = req.body.token
  if(token === null || token === undefined) {
    return res.status(401).json({message: 'must be connected'})
  }
  const dataToken = jwt_decode(token)
  User.updateOne(
    { _id: dataToken.userId },
    { $set: { 
      ...req.body
    } 
  },
    function (err) {
      if (err) return res.status(401).json({ error: 'error with editing, please try again' })
      return res.status(200).json({ message: "Edited" })
    }
  )
}
