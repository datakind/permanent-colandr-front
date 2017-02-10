const Promise = require('bluebird')
const router = require('express-promise-router')({ mergeParams: true })
const api = require('./api')
const { send } = require('./api/helpers')

router.get('/', api.populateBodyWithDefaults, render)
router.get('/tagreview', api.populateBodyWithDefaults, renderTagReview)
router.get('/tagreview/:studyId', api.populateBodyWithDefaults, renderTagReview)
router.get('/:status', api.populateBodyWithDefaults, render)
router.get('/:status/:page', api.populateBodyWithDefaults, render)

const kResultsPerPage = 10

function render (req, res) {
  const { reviewId, user } = req.body

  let status = req.params.status || 'not_started'
  let page = Number(req.query.page) || 0

  return Promise.join(
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
  const reviewId = req.body.reviewId
  const studyId = req.params.studyId

  Promise.join(
    api.extraction.getExtractedItems(req.body.user, studyId),
    api.extraction.getMetadata(studyId, 'biome'), // TODO: Use alternate call to retrieve all items.
    send(`/studies/${studyId}`, req.body.user, { qs: { fields: 'citation.title' } }),
    (accepted, metadata, study) => {
      let extracted = accepted.extracted_items
      let tags = {}
      metadata.forEach(item => {
        console.warn('item', item)
        let accepted = extracted.find(ex => (ex.label === item.metaData) &&
          Array.isArray(ex.value) && ex.value.includes(item.value))
        if (!accepted) {
          let tag = `${item.metaData}: ${item.value}`
          tags[tag] = tags[tag] || []
          tags[tag].push(item)
        }
      })
      res.render('extraction/tagreview/index', {
        reviewId,
        studyId,
        studyTitle: study.citation.title,
        tags
      })
    }
  )
}

module.exports = router
