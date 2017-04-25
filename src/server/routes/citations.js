const bluebird = require('bluebird')
const _ = require('lodash')
const router = require('express-promise-router')({ mergeParams: true })
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

  return bluebird.join(
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

function importPage (req, res) {
  return api.imports.get(req.body)
    .then(imports => {
      const renderObj = { reviewId: req.body.reviewId, imports }
      return res.render('citations/import/index', renderObj)
    })
}

function createImport (req, res) {
  return api.imports.create(req.body, req.files)
  .then(() => res.redirect(`/reviews/${req.body.reviewId}/citations/import#history`))
  .catch(err => {
    let msg = err.error.message || _.map(err.error.messages, (val, key) => {
      return key + ': ' + val
    }).join(', ')
    req.flash('error', msg)
    res.redirect(`/reviews/${req.body.reviewId}/citations/import`)
  })
}

module.exports = router
