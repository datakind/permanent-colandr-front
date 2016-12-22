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
router.post('/screenings',
  api.populateBodyWithDefaults,
  screenCitations, showCitations)

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

function getProgress (req, next) {
  api.progress.get(req.body, 'True')
    .then(progress => {
      req.body.progress = progress
      next()
    })
}

function getPlan (req, next) {
  api.plans.get(req.body)
    .then(plan => {
      req.body.plan = plan
      next()
    })
}

function attachUsers (req, next) {
  api.users.getTeam(req.body.user, req.body)
    .then(users => {
      var userMap = {}
      for (var i = 0; i < users.length; i++) {
        userMap[users[i].id] = users[i].name
      }
      req.body.users = userMap
      next()
    })
}

function showCitations (req, res, next) {
  var pageNum = req.params.page
  if (pageNum === undefined) {
    pageNum = 1
  }
  var orderBy = req.query.order_by
  if (orderBy === undefined) {
    orderBy = 'relevance'
  }
  console.log(orderBy)
  getProgress(req, p => getPlan(req,
    n => attachUsers(req, o => api.citations.get(req.body, pageNum, req.params.status, req.query.tsquery, orderBy, req.query.tag)
     .then(citations => {
       console.log('users %s', req.body.users)
       var numberOfPages = Math.ceil(req.body.progress.citation_screening[req.params.status] / 100)
       var range = pageRange(pageNum, numberOfPages)
       const renderObj = { reviewId: req.body.reviewId, studies: citations, page: pageNum, citationProgress: req.body.progress.citation_screening, selectionCriteria: req.body.plan.selection_criteria, numPages: numberOfPages, range: range, shownStatus: req.params.status, order_by: orderBy, tsquery: req.query.tsquery, tag: req.query.tag, users: req.body.users, userId: req.body.user.user_id }
       res.render('citations/show', renderObj)
     }))))
}

function pageRange (pageNum, numPages) {
  var endpoint = Math.min(Math.max(parseInt(pageNum) + 5, 11), numPages)
  var pageNav = []
  for (var i = Math.max(parseInt(pageNum) - 5, 1); i < endpoint; i++) {
    pageNav.push(i)
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
