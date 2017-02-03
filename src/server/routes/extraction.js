const Promise = require('bluebird')
const router = require('express-promise-router')({ mergeParams: true })
const api = require('./api')
const { send } = require('./api/helpers')

router.get('/', api.populateBodyWithDefaults, render)
router.get('/:status', api.populateBodyWithDefaults, render)
router.get('/:status/:page', api.populateBodyWithDefaults, render)

router.get('/tagreview/:studyId', api.populateBodyWithDefaults, renderTagReview)

const kResultsPerPage = 10

function render (req, res) {
  const { reviewId, user } = req.body

  let status = req.params.status || 'not_started'
  let page = Number(req.query.page) || 0

  Promise.join(
    api.progress.get({ reviewId, user }, true),
    send('/studies', user, { qs: {
      review_id: reviewId,
      data_extraction_status: status,
      page,
      per_page: kResultsPerPage
    } }),
    (progress, studies) => {
      let counts = {
        not_started: progress.data_extraction.not_started,
        incomplete: progress.data_extraction.started,
        complete: progress.data_extraction.finished
      }
      let numPages = Math.ceil(counts[status] / kResultsPerPage) || 1
      res.render('extraction/index', {
        reviewId,
        status,
        studies,
        page,
        counts,
        numPages
      })
    })
}

function renderTagReview (req, res) {
  const { reviewId, user } = req.body

  let status = req.params.status || 'not_started'
  let page = Number(req.query.page) || 0

  Promise.join(
    api.progress.get({ reviewId, user }, true),
    send('/studies', user, { qs: {
      review_id: reviewId,
      data_extraction_status: status,
      page,
      per_page: kResultsPerPage
    } }),
    (progress, studies) => {
      let counts = {
        not_started: progress.data_extraction.not_started,
        incomplete: progress.data_extraction.started,
        complete: progress.data_extraction.finished
      }
      let numPages = Math.ceil(counts[status] / kResultsPerPage) || 1
      res.render('extraction/tagreview/index', {
        reviewId,
        status,
        studies,
        page,
        counts,
        numPages
      })
    })
}

module.exports = router
