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

function showCitations (req, res, next) {
  var pageNum = req.params.page
  if (pageNum === undefined) {
    pageNum = 0
  }
  api.progress.get(req.body)
  .then(progress => {
    api.citations.get(req.body, pageNum)
     .then(citations => {
       const renderObj = { reviewId: req.body.reviewId, studies: citations, page: pageNum, citationProgress: progress.citation_screening }
       res.render('citations/show', renderObj)
     })
  })
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
