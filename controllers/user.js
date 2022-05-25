const crypto = require('crypto')
const bcrypt = require('bcrypt')
const env = require('../conf/env')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Token = require('../models/Token')
const jwt_decode = require('jwt-decode')
const transporter = require('../conf/mail')

exports.signup = async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10)
  const userExist = await User.findOne({ email: req.body.email })
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
        const mailOptions = {
          from: env.EMAIL_USERNAME,
          to: req.body.email,
          subject: 'Account Verification link',
          text:
            'Hello' +
            req.body.pseudo +
            ',\n\n' +
            'Please verify your account by clicking the link: \nhttp://' +
            env.DOMAINE_FRONT +
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
          return res.json({ message: 'Email confirmaiton sent' })
        })
      })
    })
  } else {
    if (!userExist.isVerified)
      return res.status(400).send({
        resendEmail: true,
        email: req.body.email,
        error: 'Your Email has not been verified',
      })
    const passwordCompare = await bcrypt.compare(
      req.body.password,
      userExist.password
    )
    if (passwordCompare)
      return res.status(400).send({ valid: true, email: req.body.email })
    if (!passwordCompare && userExist.desactivate_user === 1)
      return res
        .status(400)
        .send({ error: true, password: true, email: req.body.email })
    if (userExist) return res.status(400).send({ error: 'email already used' })
    return res.status(404).send({ error: 'user not found' })
  }
}

exports.login = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  })
  if (!user) {
    return res.status(400).json({
      error: 'user not found',
    })
  }
  const valid = await bcrypt.compare(req.body.password, user.password)
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
      error: 'email or password incorrect please try again',
    })
  } else if (!user.isVerified) {
    return res.status(400).send({
      resendEmail: true,
      email: req.body.email,
      error: 'Your Email has not been verified',
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
}

exports.confirmEmail = async (req, res) => {
  const token = await Token.findOne({
    token: req.params.token,
  })
  if (!token) {
    return res.status(400).send({
      error:
        'Your verification link may have expired. Please click on resend for verify your Email.',
    })
  } else {
    const user = await User.findOne({
      _is: token._userId,
      email: req.params.email,
    })
    if (!user) {
      return res.status(401).send({
        error:
          'We were unable to find a user for this verification. Please Signup!',
      })
    } else if (user.isVerified) {
      return res.status(200).send({
        message: 'User has been already verified. Please Login',
      })
    } else {
      user.isVerified = true
      await user.save({
        validateModifiedOnly: true,
      })
      return res.status(201).json({
        message: 'Your account has been successfuly verified',
      })
    }
  }
}

exports.resendLink = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  })
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
      const mailOptions = {
        from: env.EMAIL_USERNAME,
        to: user.email,
        subject: 'Account Verification',
        text:
          'Hello' +
          ',\n\n' +
          'Please verify your account by clicking the link: \nhttp://' +
          env.DOMAINE_FRONT +
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
}

exports.linkPasswordReset = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  })
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
    const mailOptions = {
      from: env.EMAIL_USERNAME,
      to: user.email,
      subject: 'Password reset',
      text:
        'Hello ' +
        user.pseudo +
        ',\n\n' +
        'Click on this link for reset your password: \nhttp://' +
        env.DOMAINE_FRONT +
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
}

exports.resetPassword = async (req, res) => {
  const token = await Token.findOne({ userId: req.body.token })
  if (!token) return res.status(400).send({ error: 'token expire' })
  const hash = await bcrypt.hash(req.body.password, 10)
  User.updateOne(
    { _id: token._userId },
    { $set: { password: hash } },
    function (err) {
      if (err) return res.status(500).send({ error: 'error, please try again' })
      return res.status(200).send({ message: 'password updated successfuly' })
    }
  )
}

exports.userProfile = async (req, res) => {
  const token = req.params.token
  if (token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'must be connected' })
  }
  const dataToken = jwt_decode(token)
  const user = await User.findOne({ _id: dataToken.userId })
  if (!user) {
    return res.status(404).json({ error: 'User not found, please try again' })
  }
  return res.status(200).json({ pseudo: user.pseudo, email: user.email })
}

exports.editUserProfile = (req, res) => {
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

exports.deleteAccount = async (req, res) => {
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

exports.recupAccountByPassword = async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).send({ error: 'please send correct the form' })
  const user = await User.findOne({
    email: req.body.email,
  })
  if (!user) {
    return res.status(400).json({
      error: 'user not found',
    })
  }
  const comparePassword = await bcrypt.compare(req.body.password, user.password)
  if (!comparePassword)
    return res
      .status(400)
      .send({ error: 'incorrect password', passwordNotEqual: true })
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
}

exports.recupAccountByBtn = async (req, res) => {
  if (!req.body.email)
    return res.status(400).send({ error: 'please send correct the form' })
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
