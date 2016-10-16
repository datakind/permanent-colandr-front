const express = require('express')
const router = express.Router()
const api = require('./api')

router.get('/', api.auth.authenticate, index)

// reviews routes

function index (req, res, next) {
  api.reviews.get(req.session.user)
  .then(reviews => res.render('reviews/index', { reviews }))
  .catch(err => {
    console.log(err)
    next()
  })
}

module.exports = router
