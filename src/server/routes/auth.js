const express = require('express')
const router = express.Router()
const api = require('./api')

router.get('/signin', index)
router.post('/signin', signin, api.auth.authenticate, goUserHome)
router.post('/signup', signup, signin)

// auth routes

function index (req, res, next) {
  res.render('auth/index', {})
}

function signin (req, res, next) {
  api.auth.signin(req.body)
    .then(token => {
      req.session.user = token
      next()
    })
    .catch(err => {
      console.log(err)
      req.flash('error', 'Could not login with the provided email and password')
      res.redirect('/signin#signin')
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
    console.log(err)
    req.flash('error', 'Could not register with the provided information')
    res.redirect('/signin#signup')
  })
}

module.exports = router
