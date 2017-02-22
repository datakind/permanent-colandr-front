const Promise = require('bluebird')
const express = require('express')
const router = express.Router({ mergeParams: true })
const { send } = require('./api/helpers')
const api = require('./api')

router.get('/', api.populateBodyWithDefaults, index)
router.put('/', api.populateBodyWithDefaults, parseLists, update)

// plans routes

function index (req, res, next) {
  const { reviewId, user } = req.body
  return Promise.join(
    send(`/reviews/${reviewId}`, user, { qs: { fields: 'name,owner_user_id' } }),
    // api.reviews.getName(user, reviewId),
    api.plans.get(req.body),
    (reviewInfo, plan) => {
      res.render('plans/index', {
        isOwner: user.user_id === reviewInfo.owner_user_id,
        reviewName: reviewInfo.name,
        reviewId,
        plan
      })
    }
  )
  .catch(api.handleError(next))
}

function update (req, res, next) {
  req.body.fields = Object.keys(req.body)[0]
  const section = req.body.fields.replace(/_/g, '-')

  api.plans.update(req.body)
    .then(plan => res.redirect(`/reviews/${plan.id}/plan#${section}-a`))
    .catch(api.handleError(next))
}

// middleware

// This fn takes a string of comma separated items and
// sensibly transforms them into arrays. Afterwards, it
// associates those lists back where they need to be
// in the request body.

function parseLists (req, res, next) {
  let keyterms = req.body.keyterms
  let dataExtractionForm = req.body.data_extraction_form

  let lists = [
    [keyterms, 'synonyms'],
    [dataExtractionForm, 'allowed_values']
  ]

  lists.filter(([list]) => list).forEach(splitStr)
  next()
}

function splitStr ([collection, key]) {
  collection.forEach(list => {
    if (list[key]) {
      list[key] = list[key].split(',').map(el => el.trim())
    } else {
      delete list[key]
    }
  })
}

module.exports = router
