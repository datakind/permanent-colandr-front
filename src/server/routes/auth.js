const { send } = require('./api/helpers')
const bluebird = require('bluebird')
const router = require('express-promise-router')({ mergeParams: true })
const api = require('./api')

router.get('/signin', index)
router.get('/register/:token', register)
router.post('/signin', signin, api.auth.authenticate, goUserHome)
router.post('/signup', signup, signin)
/* new */
router.get('/logout', logout)

router.get('/reset/:token', reset)
router.get('/reset', reset)
router.post('/requestReset', requestReset)
router.post('/updatePassword/:token', updatePassword)

// auth routes

function index (req, res, next) {
  res.render('auth/index', {})
}

function reset (req, res, next) {
  res.render('auth/reset', {
    token: req.params.token
  })
}

/* new */
function logout (req, res, next) {
  req.session.destroy()
  res.redirect('/')
}

function signin (req, res, next) {
  api.auth.signin(req.body)
    .then(token => {
      req.session.user = token
      next()
    })
    .catch(err => {
      console.log('Login failed: ' + err)
      req.flash('error', 'Could not login with the provided email and password')
      res.redirect('/signin#signin')
    })
}

function register (req, res, next) {
  send(`/register/${req.params.token}`, '', { auth: null })
  .then(() => {
    req.flash('success', 'Congratulations, you have successfully registered!')
    res.redirect('/signin#signin')
  })
  .catch(err => {
    console.log('Register failed: ' + err)
    req.flash('error', 'Could not register user with provided credentials!')
    res.redirect('/signin#signin')
  })
}

function requestReset (req, res, next) {
  return bluebird.try(() => {
    if (!req.body.email) {
      throw new Error('Please provide a valid email address.')
    }
    return api.auth.requestReset(req.body.email)
  })
  .then(() => {
    req.flash('success', 'Password reset requested. Please check your email.')
    res.redirect('/signin')
  })
  .catch(err => {
    console.log('Password reset request failed: ' + err)
    req.flash('error', err.message)
    res.redirect('/reset')
  })
}

function updatePassword (req, res, next) {
  return bluebird.try(() => {
    if (!req.body.password || req.body.password !== req.body.password_dup) {
      throw new Error('Passwords don\'t match')
    }
    return api.auth.submitReset(req.params.token, req.body.password)
  })
  .then(token => {
    req.session.user = token
    req.flash('success', 'Password updated. Please log in.')
    res.redirect('/signin#signin')
  })
  .catch(err => {
    console.log('Password reset failed: ' + err)
    let details = ': ' + err.message
    if (err.statusCode === 500) {
      details = ': invalid request.'
    } else {
      try {
        details = ': ' + err.error.messages.password.join('\n')
      } catch (e) {}
    }
    req.flash('error', 'Could not reset password' + details)
    res.redirect(`/reset/${req.params.token}`)
  })
}

function goUserHome (req, res, next) {
  res.redirect('/reviews')
}

function signup (req, res, next) {
  api.auth.signup(req.body)
    .then(success => {
      req.flash('success', 'Thanks for signing up! Please check your email to confirm your account.')
      res.redirect('/signin#signin')
    })
    .catch(err => {
      console.log('Signup failed: ' + err)
      let details = ''
      try {
        details = ': ' + err.error.messages.password.join('\n')
      } catch (e) {}
      req.flash('error', 'Could not register with the provided information' + details)
      res.redirect('/signin#signup')
    })
}

module.exports = router
