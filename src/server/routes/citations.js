const express = require('express')
const router = express.Router({ mergeParams: true })
const upload = require('multer')()
const api = require('./api')

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
router.get('/:page',
  api.populateBodyWithDefaults,
  showCitations)
router.post('/screenings/:page',
  api.populateBodyWithDefaults,
  screenCitations, showCitations)
router.post('/screenings',
  api.populateBodyWithDefaults,
  screenCitations, showCitations)

function screenCitations (req, res, next) {
  api.citations.post(req.body)
  next()
}

function getProgress (req) {
  api.progress.get(req.body)
    .then(progress => {
      req.body.progress = progress
    })
}

function getPlan (req) {
  api.plans.get(req.body)
    .then(plan => {
      req.body.plan = plan
    })
}

function showCitations (req, res, next) {
  var pageNum = req.params.page
  if (pageNum === undefined) {
    pageNum = 0
  }
  getProgress(req)
  getPlan(req)
  api.citations.get(req.body, pageNum)
     .then(citations => {
       var numberOfPages = Math.ceil(req.body.progress.citation_screening.not_screened / 10)
       var range = pageRange(pageNum, numberOfPages)
       const renderObj = { reviewId: req.body.reviewId, studies: citations, page: pageNum, citationProgress: req.body.progress.citation_screening, selectionCriteria: req.body.plan.selection_criteria, numPages: numberOfPages, range: range }
       res.render('citations/show', renderObj)
     })
}

function pageRange (pageNum, numPages) {
  console.log(pageNum)
  console.log(numPages)
  console.log(parseInt(pageNum) + 5)
  var endpoint = Math.min(parseInt(pageNum) + 5, numPages)
  console.log(endpoint)
  var pageNav = []
  for (var i = Math.max(parseInt(pageNum) - 5, 0); i < endpoint; i++) {
    pageNav.push(i)
    console.log(i)
  }
  return pageNav
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
