const { send } = require('./helpers')
const Promise = require('bluebird')
const jwt = require('jsonwebtoken')
Promise.promisifyAll(jwt)

function signin (body) {
  let { email, password } = body
  if (!(email && password)) return Promise.reject()

  return send('/authtoken', '', {
    auth: {
      user: email,
      pass: password,
      sendImmediately: false
    }
  })
}

function signup (body) {
  let { name, email, password } = body
  if (!(name && email && password)) return Promise.reject()

  return send('/register', '', {
    method: 'POST',
    body: { name, email, password }
  })
}

function _verify (user) {
  let token = user && user.token
  return jwt.verifyAsync(token, process.env.JWT_SECRET_KEY)
  .then(payload => ({ token: token, user_id: payload.id }))
}

function devAutoSignin (next) {
  // Log in automatically with configured login.
  return signin({
    email: process.env.APP_LOGIN_EMAIL,
    password: process.env.APP_LOGIN_PASSWORD
  })
  .then(devuser => {
    console.log('DEVELOPMENT user token', devuser.token)
    return _verify(devuser)
  })
  .catch(err => {
    console.log('DEVELOPMENT auto-login failed')
    throw new Error('Development auto-login failed: ' + err.message)
  })
}

function authenticate (req, res, next) {
  let { user } = req.session
  return Promise.try(() => {
    if (user && user.token) {
      return _verify(user)
    }
    if (process.env.NODE_ENV === 'development') {
      return devAutoSignin()
    }
    throw new Error('You must be logged in to reach this page.')
  })
  .then(
    userInfo => {
      // TODO: Refresh token
      req.session.user = userInfo
      res.locals.currentUser = userInfo
      next()
    },
    err => {
      req.flash('error', err.message)
      res.redirect('/signin#signin')
    }
  )
}

module.exports = {
  signin, signup, authenticate
}
