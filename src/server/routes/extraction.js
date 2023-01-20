const Promise = require('bluebird')
const router = require('express-promise-router')({ mergeParams: true })
const api = require('./api')
const { send } = require('./api/helpers')

router.get('/', api.populateBodyWithDefaults, render)
router.get('/tagreview', api.populateBodyWithDefaults, renderTagReview)
router.get('/tagreview/:studyId', api.populateBodyWithDefaults, renderTagReview)
router.get('/finalize/:studyId', api.populateBodyWithDefaults, finalizeStudy)
router.get('/reopen/:studyId', api.populateBodyWithDefaults, reopenStudy)
router.get('/:status', api.populateBodyWithDefaults, render)
router.get('/:status/:page', api.populateBodyWithDefaults, render)

const kResultsPerPage = 10

function render (req, res) {
  const { reviewId, user } = req.body

  let status = req.params.status || 'not_started'
  let page = Number(req.query.page) || 0

  return Promise.join(
    api.reviews.getName(user, reviewId),
    api.progress.get({ reviewId, user }, true),
    send('/studies', user, { qs: {
      review_id: reviewId,
      data_extraction_status: status,
      page,
      per_page: kResultsPerPage
    } }),
    (reviewName, progress, studies) => {
      let counts = {
        not_started: progress.data_extraction.not_started,
        started: progress.data_extraction.started,
        finished: progress.data_extraction.finished
      }
      let numPages = Math.ceil(counts[status] / kResultsPerPage) || 1

      return res.render('extraction/index', {
        reviewName,
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
  const studyId = req.params.studyId

  return Promise.join(
    api.reviews.getName(user, reviewId),
    api.extraction.getSuggestedLabels(user, studyId),
    send(`/studies/${studyId}`, user, { qs: { fields: 'citation.title,data_extraction_status' } }),
    (reviewName, labels, study) => {
      if (Object.keys(labels).length > 0 && study.data_extraction_status !== 'finished') {
        res.render('extraction/tagreview/index', {
          reviewName,
          reviewId,
          studyId,
          studyTitle: study.citation.title,
          labels
        })
      } else {
        res.redirect(`../../fulltext/tags/${studyId}`)
      }
    }
  )
}

function finalizeStudy (req, res) {
  const { reviewId, user } = req.body
  const studyId = req.params.studyId

  return send(`/studies/${studyId}`, user, {
    method: 'PUT',
    body: {
      data_extraction_status: 'finished'
    }
  })
  .then(() => {
    res.redirect(`/reviews/${reviewId}/extraction`)
  })
  .catch(err => req.flash('error', err.message))
}

function reopenStudy (req, res) {
  const { reviewId, user } = req.body
  const studyId = req.params.studyId

  return send(`/studies/${studyId}`, user, {
    method: 'PUT',
    body: {
      data_extraction_status: 'started'
    }
  })
  .then(() => {
    res.redirect(`/reviews/${reviewId}/fulltext/tags/${studyId}`)
  })
  .catch(err => req.flash('error', err.message))
}

module.exports = router
