const express = require('express')
const router = express.Router({ mergeParams: true })
const api = require('./api')

router.get('/',
  api.populateBodyWithDefaults,
  index)
router.put('/:id',
  api.populateBodyWithDefaults,
  parseLists,
  update)

// plans routes

function index (req, res, next) {
  api.plans.get(req.body)
    .then(plan => res.render('plans/index', { plan }))
    .catch(api.handleError(next))
}

function update (req, res, next) {
  req.body.fields = Object.keys(req.body)[0]
  const section = req.body.fields.replace(/_/g, '-')

  api.plans.update(req.body)
    .then(plan => res.redirect(`/reviews/${plan.review_id}/plan#${section}-a`))
    .catch(api.handleError(next))
}

// middleware

function parseLists (req, res, next) {
  let keyterms = req.body.keyterms
  let dataExtractionForm = req.body.data_extraction_form

  let lists = [
    [keyterms, 'synonyms'],
    [dataExtractionForm, 'allowed_values']
  ]

  lists.forEach(([list, key]) => {
    if (list) {
      list.forEach((listObj) => {
        if (listObj[key]) {
          listObj[key] = listObj[key].split(',').map(el => el.trim())
        } else {
          delete listObj[key]
        }
      })
    }
  })

  next()
}

module.exports = router