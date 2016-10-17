const express = require('express')
const router = express.Router({ mergeParams: true })
const api = require('./api')

router.get('/', index)

// plans routes

function index (req, res, next) {
  const { reviewId } = req.params
  const { user } = req.session
  api.plans.get(user, reviewId)
    .then(plan => res.render('reviews/plans/index', { plan }))
    .catch(api.handleError(next))
}

module.exports = router
