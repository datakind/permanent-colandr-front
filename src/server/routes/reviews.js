const express = require('express')
const router = express.Router()
const api = require('./api')

router.get('/', index)
router.get('/new', newReview)
router.get('/:id', show)
router.get('/:id/settings/edit', settingsEdit)
router.post('/', create)

// reviews routes

function index (req, res, next) {
  api.reviews.get(req.session.user)
    .then(reviews => res.render('reviews/index', { reviews }))
    .catch(api.handleError(next))
}

function newReview (req, res, next) {
  let review = {}
  res.render('reviews/new', { review })
}

function show (req, res, next) {
  api.reviews.get(req.session.user, req.params.id)
    .then(review => res.render('reviews/show', { review }))
    .catch(api.handleError(next))
}

function settingsEdit (req, res, next) {
  api.reviews.get(req.session.user, req.params.id)
    .then(review => res.render('reviews/settings/edit', { review }))
    .catch(api.handleError(next))
}

function create (req, res, next) {
  api.reviews.create(req.session.user, req.body)
    .then(review => {
      req.flash('success', `${review.name} has been created!`)
      res.redirect('/reviews')
    })
    .catch(api.handleError(next))
}

module.exports = router
