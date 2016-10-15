const express = require('express')
const router = express.Router()
const api = require('./api')

router.get('/signin', index)
router.post('/signin', signin)

////

function index (req, res, next) {
  res.render('auth/index', {})
}

function signin (req, res, next) {
  api.signin(req.body)
    .then(auth => {
      res.status(201).json(auth)
    })
    .catch(err => {
      req.flash('error', 'Could not login with the provided email and password')
      res.redirect('/signin#signin')
    })
}

module.exports = router
