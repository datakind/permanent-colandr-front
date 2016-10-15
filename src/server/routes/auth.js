const express = require('express')
const router = express.Router()
const api = require('./api')

router.get('/signin', index)
router.post('/signin', signin)
router.post('/signup', signup, signin)

// auth routes

function index (req, res, next) {
  res.render('auth/index', {})
}

function signin (req, res, next) {
  api.signin(req.body)
    .then(auth => {
      res.status(201).json(auth)
    })
    .catch(err => {
      console.log(err)
      req.flash('error', 'Could not login with the provided email and password')
      res.redirect('/signin#signin')
    })
}

function signup (req, res, next) {
  api.signup(req.body)
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
