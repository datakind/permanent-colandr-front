const { send } = require('./helpers')
const Promise = require('bluebird')
const dateformat = require('dateformat')
const jwt = require('jsonwebtoken')
Promise.promisifyAll(jwt)

const kRefreshAfterSec = 300

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
  .then(user => Object.assign(user, { lastRefreshed: Date.now() }))
}

function signup (body) {
  let { name, email, password } = body
  if (!(name && email && password)) return Promise.reject()

  return send('/register', '', {
    method: 'POST',
    auth: null,
    qs: {
      server_name: 'http://www.colandrapp.com'
    },
    body: {
      name,
      email,
      password
    }
  })
}

function requestReset (email) {
  if (!email) return Promise.reject()

  return send('/reset', '', {
    method: 'POST',
    auth: null,
    qs: {
      email,
      server_name: 'http://www.colandrapp.com'
    }
  })
}

function submitReset (token, newPassword) {
  if (!(token && newPassword)) return Promise.reject()

  return send(`/reset/${token}`, '', {
    method: 'PUT',
    auth: null,
    body: {
      password: newPassword
    }
  })
}

function datestr (timestamp) {
  return dateformat(new Date(timestamp), 'isoDateTime')
}

function tokenDesc (token) {
  let decoded = jwt.decode(token, {complete: true})
  let expiresAt = decoded.header.exp * 1000
  return `Token id=${decoded.payload.id} exp ${datestr(expiresAt)}`
}

function fillUserInfo (user) {
  return send(`/users/${user.user_id}`, user, { qs: { fields: 'name,email' } })
  .then(info => Object.assign(user, { name: info.name, email: info.email }))
}

function _verify (user) {
  return Promise.try(() => {
    if (user.lastRefreshed && Date.now() > user.lastRefreshed + kRefreshAfterSec * 1000) {
      // It's been a while since the token was issued; let's refresh it.
      console.log('Refreshing old token: %s', tokenDesc(user.token))
      return send('/authtoken', user)
      .then(user => Object.assign(user, { lastRefreshed: Date.now() }))
      .catch(err => {
        console.log('Refresh failed: %s', err)
        return user
      })
    } else {
      return user
    }
  })
  .then(user => {
    console.log('Verifying auth token: %s obtained at %s', tokenDesc(user.token),
      datestr(user.lastRefreshed))
    return jwt.verifyAsync(user.token, process.env.JWT_SECRET_KEY)
    .then(payload => Object.assign({}, user, { user_id: payload.id }))
  })
  .then(user => user.name ? user : fillUserInfo(user))
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
  return Promise.try(() => {
    let { user } = req.session
    if (user && user.token) {
      return _verify(user)
    }
    if (process.env.NODE_ENV === 'development') {
      return devAutoSignin()
    }
    throw new Error('You must be logged in to reach this page.')
  })
  .then(
    user => {
      req.session.user = user
      res.locals.currentUser = user
      next()
    },
    err => {
      req.flash('error', err.message)
      res.redirect('/signin#signin')
    }
  )
}

module.exports = {
  signin, signup, authenticate, requestReset, submitReset
}
