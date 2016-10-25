const express = require('express')
const router = express.Router({ mergeParams: true })
const upload = require('multer')()
const rp = require('request-promise')
const api = require('./api')

router.get('/import',
  api.populateBodyWithDefaults,
  importPage)
router.post('/import',
  upload.fields([{ name: 'uploaded_file', maxCount: 1 }]),
  api.populateBodyWithDefaults,
  createImport)

// reviews routes

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
