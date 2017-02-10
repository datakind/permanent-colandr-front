const Promise = require('bluebird')
const _ = require('lodash')
const express = require('express')
const router = express.Router({ mergeParams: true })
const upload = require('multer')()
const api = require('./api')
const { send } = require('./api/helpers')
const keyterms = require('./keyterms')

const kResultsPerPage = 100

router.get('/import',
  api.populateBodyWithDefaults,
  importPage)
router.post('/import',
  upload.fields([{ name: 'uploaded_file', maxCount: 1 }]),
  api.populateBodyWithDefaults,
  createImport)
router.get('/',
  api.populateBodyWithDefaults,
  showCitations)
router.get('/:status',
  api.populateBodyWithDefaults,
  showCitations)
router.get('/:status/:page',
  api.populateBodyWithDefaults,
  showCitations)
router.post('/tags/:citationId',
  api.populateBodyWithDefaults,
  addTags)
router.post('/screenings/:status/:page',
  api.populateBodyWithDefaults,
  screenCitations, showCitations)
router.post('/screenings/submit',
  api.populateBodyWithDefaults,
  screenCitation)
router.post('/screenings/change',
  api.populateBodyWithDefaults,
  changeCitation)
router.post('/screenings/delete',
  api.populateBodyWithDefaults,
  deleteCitation)
router.post('/screenings',
  api.populateBodyWithDefaults,
  screenCitations, showCitations)

function deleteCitation (req, res, next) {
  api.citations.deleteCitation(req.body).then(data =>
    res.json(data)
  )
}

function changeCitation (req, res, next) {
  api.citations.deleteCitation(req.body).then(d =>
    api.citations.post(req.body).then(data =>
      res.json(data)
    )
  )
}

function screenCitation (req, res, next) {
  api.citations.post(req.body).then(data =>
    res.json(data)
  )
}

function addTags (req, res, next) {
  var citationId = req.params.citationId
  api.citations.addTags(citationId, req.body).then(data =>
    res.json(data)
  )
}

function screenCitations (req, res, next) {
  api.citations.post(req.body)
  next()
}

function apiGetStudies (user, apiParams) {
  return send('/studies', user, { qs: apiParams })
}

function showCitations (req, res, next) {
  const { reviewId, user } = req.body
  let shownStatus = req.params.status || 'pending'
  let pageNum = parseInt(req.params.page) || 1
  let orderBy = req.query.order_by || 'relevance'

  let apiParams = {
    review_id: reviewId,
    fields: 'id,citation.title,citation.authors,citation.journal_name,citation.pub_year,' +
      'citation.abstract,citation.keywords,citation.screenings,citation_status,tags',
    citation_status: shownStatus,
    tag: req.query.tag || undefined,
    tsquery: req.query.tsquery || undefined,
    order_by: orderBy,
    // order_dir can be 'ASC' or 'DESC'; assume the default is the choice that makes sense.
    page: pageNum - 1,
    per_page: kResultsPerPage
  }

  return Promise.join(
    api.reviews.getName(user, reviewId),
    api.progress.get(req.body, true, 'citation_screening'),
    api.plans.get(req.body),
    api.users.getTeam(user, req.body),
    api.citations.getTags(req.body, pageNum),
    apiGetStudies(user, apiParams),
    (reviewName, progress, plan, users, tags, studies) => {
      let userMap = _.fromPairs(users.map(u => [u.id, u.name]))
      let countResults = progress.citation_screening[shownStatus] || 0
      let numPages = Math.max(Math.ceil(countResults / kResultsPerPage), 1)
      let firstNavPage = _.clamp(pageNum - 5, 1, numPages)
      let lastNavPage = _.clamp(firstNavPage + 9, 1, numPages)

      let keytermsRE = keyterms.getKeytermsRE(plan.keyterms)
      for (let study of studies) {
        keyterms.markKeywordsCitation(study.citation, keytermsRE)
      }

      let context = {
        reviewId: reviewId,
        reviewName: reviewName,
        studies: studies,
        page: pageNum,
        numPages: numPages,
        range: _.range(firstNavPage, lastNavPage + 1),
        citationProgress: progress.citation_screening,
        selectionCriteria: plan.selection_criteria,
        shownStatus: shownStatus,
        order_by: orderBy,
        tsquery: req.query.tsquery,
        tag: req.query.tag,
        users: userMap,
        userId: user.user_id,
        tags: tags,
        urlPageBase: `/reviews/${reviewId}/citations/${shownStatus}`
      }
      res.render('citations/show', context)
    }
  )
}

function importPage (req, res, next) {
  api.imports.get(req.body)
    .then(imports => {
      const renderObj = { reviewId: req.body.reviewId, imports }
      res.render('citations/import/index', renderObj)
    })
}

function createImport (req, res, next) {
  api.imports.create(req.body, req.files)
    .then(() => {
      const path = `/reviews/${req.body.reviewId}/citations/import#history`
      res.redirect(path)
    })
    .catch(api.handleError(next))
}

module.exports = router
