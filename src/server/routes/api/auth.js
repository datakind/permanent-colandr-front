const { send } = require('./helpers')
const jwt = require('jsonwebtoken')

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

function authenticate (req, res, next) {
  // TODO: Remove)
  if (process.env.NODE_ENV === 'development') {
    signin({
      email: process.env.APP_LOGIN_EMAIL,
      password: process.env.APP_LOGIN_PASSWORD
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
