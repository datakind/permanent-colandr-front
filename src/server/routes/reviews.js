const express = require('express')
const router = express.Router()
const api = require('./api')

router.get('/', index)
router.get('/new', newReview)
router.get('/:id', show)
router.get('/:id/settings', settings)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', del)

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

function settings (req, res, next) {
  let requests = [
    api.reviews.get(req.session.user, req.params.id),
    api.teams.get(req.session.user, req.params.id)
  ]

  Promise.all(requests)
    .then(([review, team]) => res.render('reviews/settings', { review, team }))
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

function update (req, res, next) {
  let { id } = req.params
  req.body.id = id

  api.reviews.update(req.session.user, req.body)
    .then(review => {
      req.flash('success', `Update successful!`)
      res.redirect(`/reviews/${id}/settings`)
    })
    .catch(api.handleError(next))
}

function del (req, res, next) {
  api.reviews.del(req.session.user, req.params.id)
    .then(() => res.redirect('/reviews'))
    .catch(api.handleError(next))
}

module.exports = router
