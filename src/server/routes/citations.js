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

function getProgress (req, next) {
  api.progress.get(req.body, 'True')
    .then(progress => {
      req.body.progress = progress
      next()
    })
}

function getTags (req, next) {
  api.citations.getTags(req.body)
    .then(tags => {
      req.body.tags = tags
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
    n => attachUsers(req, o => getTags(req, p =>
      api.citations.get(req.body, pageNum, req.params.status, req.query.tsquery, orderBy, req.query.tag)
       .then(citations => {
         console.log('users %s', req.body.users)
         var numberOfPages = Math.ceil(req.body.progress.citation_screening[req.params.status] / 100)
         var range = pageRange(pageNum, numberOfPages)
         processStudies(citations, req)
         const renderObj = { reviewId: req.body.reviewId, studies: citations, page: pageNum, citationProgress: req.body.progress.citation_screening, selectionCriteria: req.body.plan.selection_criteria, numPages: numberOfPages, range: range, shownStatus: req.params.status, order_by: orderBy, tsquery: req.query.tsquery, tag: req.query.tag, users: req.body.users, userId: req.body.user.user_id, tags: req.body.tags }
         res.render('citations/show', renderObj)
       })))))
}

function getKeyTerms (req) {
  console.log('getting key terms')
  var keyTerms = req.body.plan.keyterms
  var dictionary = {}
  for (var i = 0; i < keyTerms.length; i++) {
    dictionary[keyTerms[i].term] = true
    var synonyms = keyTerms[i].synonyms
    for (var j = 0; j < synonyms.length; j++) {
      dictionary[synonyms[j]] = true
    }
  }
  var terms = Object.keys(dictionary).sort(function (a, b) {
    return b.length - a.length
  })
  console.log(terms)
  console.log('get key terms')
  return terms
}

function processStudies (studies, req) {
  var keyTerms = getKeyTerms(req)
  console.log('processing studies')
  for (var i = 0; i < studies.length; i++) {
    processCitation(studies[i].citation, keyTerms)
    // console.log('processed study')
  }
}

function processCitation (citation, keyTerms) {
  // console.log('processing study')
  if (citation == null || citation.abstract == null) {
    return citation
  }
  citation.abstract = processText(citation.abstract, keyTerms)
  if (citation.keywords != null) {
    citation.keywords = processText(citation.keywords.toString(), keyTerms)
    citation.keywords = citation.keywords.toString().replace(',', ', ')
  }
  // console.log(newAbstract)
  return citation
}

function processText (wholeText, keyTerms) {
  if (wholeText == null) {
    return wholeText
  }
  // console.log(abstract)
  var text = wholeText
  var lowerText = text.toLowerCase()
  for (var i in keyTerms) {
    var keyTerm = keyTerms[i]
    // console.log(keyTerm)
    var index = lowerText.indexOf(keyTerm)
    while (index >= 0) {
      text = text.substring(0, index) + '<span class = "keyterm">' + text.substring(index, index + keyTerm.length) + '</span>' + text.substring(index + keyTerm.length)
      lowerText = text.toLowerCase()
      index = lowerText.indexOf(keyTerm, index + 24 + 7 + keyTerm.length + 1)
    }
  }
  return text
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
