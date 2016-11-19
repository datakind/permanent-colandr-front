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
router.get('/:page',
  api.populateBodyWithDefaults,
  showCitations)
router.post('/screenings/:page',
  api.populateBodyWithDefaults,
  screenCitations, showCitations)

function screenCitations (req, res, next) {
  api.citations.post(req.body)
  next()
}

function showCitations (req, res, next) {
  req.body.page = req.params.page
  api.citations.get(req.body)
    .then(citations => {
      const renderObj = { reviewId: req.body.reviewId, studies: citations, page: req.params.page }
      res.render('citations/show', renderObj)
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
