const bluebird = require('bluebird')
// const _ = require('lodash')
const router = require('express-promise-router')({ mergeParams: true })
const api = require('./api')
const { send } = require('./api/helpers')
// const keyterms = require('./keyterms')

router.get('/', api.populateBodyWithDefaults, render)
router.get('/:status', api.populateBodyWithDefaults, render)
router.get('/:status/:page', api.populateBodyWithDefaults, render)

const routeMap = {
  'not_started': 'not_started',
  'incomplete': 'started',
  'complete': 'finished'
}

function render (req, res) {
  console.warn('routes/extraction/render')
  const { reviewId, user } = req.body

  let status = req.params.status || 'not_started'
  let page = Number(req.query.page) || 0

  bluebird.join(
    api.progress.get({ reviewId, user }, true),
    send('/studies', user, { qs: {
      review_id: reviewId,
      data_extraction_status: status,
      page,
      per_page: 10
    } }),
    (progress, studies) => {
      let numPages = Math.ceil(progress.data_extraction[routeMap[status]] / 10) || 1
      res.render('extraction/index', {
        reviewId,
        status,
        counts: {
          not_started: progress.data_extraction.not_started,
          incomplete: progress.data_extraction.started,
          complete: progress.data_extraction.finished
        },
        studies,
        page,
        numPages
      })
    })
}

module.exports = router
