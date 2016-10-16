const rp = require('request-promise')
const jwt = require('jsonwebtoken')

function signin (body) {
  let { email, password } = body
  if (!(email && password)) return Promise.reject()

  let options = {
    uri: `${process.env.API_URL}/authtoken`,
    json: true,
    auth: {
      user: email,
      pass: password,
      sendImmediately: false
    }
  }

  return rp(options)
}

function signup (body) {
  let { name, email, password } = body
  if (!(name && email && password)) return Promise.reject()

  let options = {
    method: 'POST',
    uri: `${process.env.API_URL}/register`,
    json: true,
    body: { name, email, password }
  }

  return rp(options)
}

function authenticate (req, res, next) {
  // TODO: Remove
  if (process.env.NODE_ENV === 'development') {
    signin({
      email: process.env.DEV_LOGIN_EMAIL,
      password: process.env.DEV_LOGIN_PASSWORD
    }).then(token => {
      req.session.user = token
      next()
    })
  } else {
    let { user } = req.session
    if (!user || !user.token) {
      req.flash('error', 'You must be logged in to reach that page.')
      res.redirect('/signin#signin')
    } else {
      jwt.verify(user.token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
        if (err) return Promise.reject(err)

        // TODO: Refresh token
        req.session.user = {
          token: user.token,
          user_id: userInfo.id
        }

        next()
      })
    }
  }
}

module.exports = {
  signin, signup, authenticate
}
