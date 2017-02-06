const Promise = require('bluebird')
const _ = require('lodash')
const path = require('path')
const request = require('request')
const router = require('express-promise-router')({ mergeParams: true })
const upload = require('multer')()
const api = require('./api')
const { send } = require('./api/helpers')
const keyterms = require('./keyterms')

router.post('/upload', upload.fields([{ name: 'uploaded_file', maxCount: 1 }]),
  api.populateBodyWithDefaults,
  uploadFulltext)
router.get('/', api.populateBodyWithDefaults, showFulltexts)
router.get('/pdf/:id', api.populateBodyWithDefaults, showPDF)
router.get('/:status', api.populateBodyWithDefaults, showFulltexts)
router.get('/:status/:page', api.populateBodyWithDefaults, showFulltexts)
router.get('/screening/:id', api.populateBodyWithDefaults, showFullText)
router.post('/screenings/:status/:page', api.populateBodyWithDefaults, screenFulltexts,
  showFulltexts)
router.post('/screenings/submit', api.populateBodyWithDefaults, screenFulltext)
router.post('/screenings/change', api.populateBodyWithDefaults, changeFulltext)
router.post('/screenings/delete', api.populateBodyWithDefaults, deleteFulltext)
router.post('/screenings', api.populateBodyWithDefaults, screenFulltexts, showFulltexts)

const kStatusList = [
  {status: 'pending', name: 'screen'},
  {status: 'awaiting_coscreener', name: 'awaiting'},
  {status: 'conflict', name: 'in conflict'},
  {status: 'excluded', name: 'excluded'},
  {status: 'included', name: 'included'}
]

const kResultsPerPage = 100

function apiGetStudies (user, apiParams) {
  return send('/studies', user, { qs: apiParams })
}

function getContext (req, res) {
  const { reviewId, user } = req.body
  let shownStatus = req.params.status || 'pending'
  let pageNum = parseInt(req.params.page) || 1
  let orderBy = req.query.order_by || 'recency'

  let apiParams = {
    review_id: reviewId,
    fields: 'id,citation.title,citation.authors,citation.journal_name,citation.pub_year,fulltext,tags',
    fulltext_status: shownStatus,
    tag: req.query.tag || undefined,
    tsquery: req.query.tsquery || undefined,
    order_by: orderBy,
    // order_dir can be 'ASC' or 'DESC'; assume the default is the choice that makes sense.
    page: pageNum - 1,
    per_page: kResultsPerPage
  }

  return Promise.join(
    api.progress.get(req.body, true, 'fulltext_screening'),
    api.plans.get(req.body),
    api.users.getTeam(user, req.body),
    api.citations.getTags(req.body, pageNum),
    apiGetStudies(user, apiParams),
    (progress, plan, users, tags, studies) => {
      let userMap = _.fromPairs(users.map(u => [u.id, u.name]))
      let countResults = progress.fulltext_screening[shownStatus] || 0
      let numPages = Math.max(Math.ceil(countResults / kResultsPerPage), 1)
      let firstNavPage = _.clamp(pageNum - 5, 1, numPages)
      let lastNavPage = _.clamp(firstNavPage + 9, 1, numPages)

      let keytermsRE = keyterms.getKeytermsRE(plan.keyterms)
      for (let study of studies) {
        keyterms.markKeywordsCitation(study.citation, keytermsRE)
      }

      return {
        reviewId: reviewId,
        studies: studies,
        page: pageNum,
        numPages: numPages,
        range: _.range(firstNavPage, lastNavPage + 1),
        progress: progress.fulltext_screening,
        selectionCriteria: plan.selection_criteria,
        shownStatus: shownStatus,
        statusList: kStatusList,
        order_by: orderBy,
        tsquery: req.query.tsquery,
        tag: req.query.tag,
        users: userMap,
        userId: user.user_id,
        tags: tags,
        urlPageBase: `/reviews/${reviewId}/fulltext/${shownStatus}`
      }
    }
  )
}

function apiGetOneStudy (user, id) {
  let fields = 'id,citation.title,fulltext_status,fulltext.filename,fulltext.original_filename,fulltext.screenings'
  return send(`/studies/${id}`, user, { qs: { fields: fields } })
}

function showFulltexts (req, res) {
  getContext(req, res).then(ctx => {
    res.render('fulltext/show', ctx)
  })
}

function screenFulltext (req, res, next) {
  api.fulltext.post(req.body).then(data => res.json(data))
}

function screenFulltexts (req, res, next) {
  api.fulltext.post(req.body)
  next()
}

// TODO: This does not work
function changeFulltext (req, res, next) {
  api.fulltext.deleteFulltext(req.body)
  .then(() => api.fulltext.post(req.body))
  .then(() => res.end())
}

function deleteFulltext (req, res, next) {
  api.fulltext.deleteFulltext(req.body)
  .then(() => res.end())
}

function uploadFulltext (req, res, next) {
  Promise.join(api.fulltext.create(req.body, req.files), getContext(req, res),
  (fileData, ctx) => {
    res.json(_.merge(ctx, { study:
      { id: req.body.studyId }
    }))
  })
  .catch(api.handleError(next))
}

function showFullText (req, res) {
  const { reviewId, user } = req.body
  return apiGetOneStudy(user, req.params.id)
  .then(study => {
    res.render('fulltext/review', {
      reviewId: reviewId,
      study: study,
      pdf_url: `/reviews/${reviewId}/fulltext/pdf/${req.params.id}`
    })
  })
}

function showPDF (req, res) {
  const { user } = req.body
  let options = {
    uri: path.dirname(process.env.API_URL) + `/fulltexts/${req.params.id}/upload`,
    auth: { user: user.token }
  }
  // Unlike other routes, this uses request library to stream the response from the backend to the
  // browser, without downloading it into memory first.
  res.type('pdf')
  let stream = request.get(options)
  stream.pipe(res)
}

module.exports = router
