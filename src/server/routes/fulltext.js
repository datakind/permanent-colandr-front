const bluebird = require('bluebird')
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

// Show PDF route
router.get('/pdf/:id', api.populateBodyWithDefaults, showPDF)

// Screening routes
router.get('/screening/:id', api.populateBodyWithDefaults, showFullText)

router.post('/screenings/submit', api.populateBodyWithDefaults, screenFulltext)
router.post('/screenings/change', api.populateBodyWithDefaults, changeFulltext)
router.post('/screenings/delete', api.populateBodyWithDefaults, deleteFulltext)
router.post('/screenings/:status/:page', api.populateBodyWithDefaults, screenFulltexts, showFulltexts)
router.post('/screenings', api.populateBodyWithDefaults, screenFulltexts, showFulltexts)

// Label routes
router.get('/tags/:id', api.populateBodyWithDefaults, showTags)

router.post('/tags/:id', api.populateBodyWithDefaults, updateTags)

// Main list route
router.get('/', api.populateBodyWithDefaults, showFulltexts)
router.get('/:status', api.populateBodyWithDefaults, showFulltexts)
router.get('/:status/:page', api.populateBodyWithDefaults, showFulltexts)

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

  return bluebird.join(
    api.reviews.getName(user, reviewId),
    api.progress.get(req.body, true, 'fulltext_screening'),
    api.plans.get(req.body),
    api.users.getTeam(user, req.body),
    api.citations.getTags(req.body, pageNum),
    apiGetStudies(user, apiParams),
    (reviewName, progress, plan, users, tags, studies) => {
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
        reviewName: reviewName,
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
  let fields = 'id,citation.title,fulltext_status,fulltext.filename,fulltext.original_filename,fulltext.screenings,data_extraction_status'
  return send(`/studies/${id}`, user, { qs: { fields: fields } })
}

function showFulltexts (req, res) {
  return getContext(req, res).then(ctx => {
    res.render('fulltext/show', ctx)
  })
}

function screenFulltext (req, res) {
  return api.fulltext.post(req.body).then(data => res.json(data))
}

function screenFulltexts (req, res) {
  return api.fulltext.post(req.body)
}

// TODO: This does not work
function changeFulltext (req, res, next) {
  return api.fulltext.deleteFulltext(req.body)
  .then(() => api.fulltext.post(req.body))
  .then(() => res.end())
}

function deleteFulltext (req, res, next) {
  return api.fulltext.deleteFulltext(req.body)
  .then(() => res.end())
}

function uploadFulltext (req, res, next) {
  return bluebird.join(
    api.fulltext.create(req.body, req.files),
    getContext(req, res),
    (fileData, ctx) => {
      res.json(_.merge(ctx, { study:
        { id: req.body.studyId }
      }))
    })
    .catch(api.handleError(next))
}

function showFullText (req, res) {
  const { reviewId, user } = req.body
  return bluebird.join(
    api.reviews.getName(user, reviewId),
    apiGetOneStudy(user, req.params.id),
    (reviewName, study) => {
      res.render('fulltext/review', {
        reviewId: reviewId,
        reviewName: reviewName,
        study: study,
        pdf_url: `/reviews/${reviewId}/fulltext/pdf/${req.params.id}`
      })
    }
  )
}

function showTags (req, res) {
  const { reviewId, user } = req.body
  let studyId = req.params.id

  return bluebird.join(
    apiGetOneStudy(user, req.params.id),
    send(`/reviews/${reviewId}/plan`, user, { qs: { fields: 'data_extraction_form' } }),
    send(`/data_extractions/${studyId}`, user),
    api.extraction.getSuggestedLabels(user, studyId),
    (study, plan, extract, labels) => {
      let fields = makeFieldsFromPlan(plan.data_extraction_form, extract)
      res.render('fulltext/tags', {
        reviewId,
        study,
        fields,
        labelCount: Object.keys(labels).length,
        pdf_url: `/reviews/${reviewId}/fulltext/pdf/${req.params.id}`
      })
    }
  )
}

function updateTags (req, res, next) {
  console.log('updateTags', req.body)

  const { reviewId, user, action, label, value } = req.body
  let fieldType

  return bluebird.join(
    send(`/reviews/${reviewId}/plan`, user, {
      qs: { fields: 'data_extraction_form' }
    }),
    send(`/data_extractions/${req.params.id}`, user),
    (plan, extract) => {
      let planObj = _.find(plan.data_extraction_form, ['label', label])
      if (!planObj) {
        console.warn('Unable to find extracted tag in review plan!', plan.data_extraction_form)
        throw new Error('Unable to find extracted tag in review plan!')
      }

      fieldType = planObj.field_type
      let currObj = _.find(extract.extracted_items, ['label', label])

      let updValue
      switch (planObj.field_type) {
        case 'bool':
          updValue = value === 'True'
          break
        case 'select_many':
          updValue = [value]
          break
        default:
          updValue = value
      }

      if (action === 'UPDATE') {
        if (currObj) {
          // Update object in extracted_items with new values
          currObj.value = fieldType === 'select_many' ? _.union(currObj.value, updValue) : updValue
        } else {
          // Insert new object into extracted_items
          extract.extracted_items.push({
            label,
            value: updValue
          })
        }

        console.warn('new extracted items', extract.extracted_items)
        return send(`/data_extractions/${req.params.id}`, user, {
          method: 'PUT',
          body: extract.extracted_items
        })
      } else if (action === 'DELETE') {
        console.warn('deleting the object')
        if (fieldType !== 'select_many') {
          return send(`/data_extractions/${req.params.id}`, user, {
            method: 'DELETE',
            qs: {
              labels: label
            }
          })
        }

        _.pull(currObj.value, value)
        if (currObj.value.length > 0) {
          // If there're still values in the array, update
          return send(`/data_extractions/${req.params.id}`, user, {
            method: 'PUT',
            body: extract.extracted_items
          })
        } else {
          // Otherwise, remove the label altogether
          return send(`/data_extractions/${req.params.id}`, user, {
            method: 'DELETE',
            qs: {
              labels: label
            }
          })
        }
      } else {
        res.status(500).send({ error: 'Unknown action received from client!' })
      }
    }
  )
  .then(() => {
    if (fieldType === 'select_one' || fieldType === 'select_many') {
      return send(`/data_extractions/${req.params.id}`, user)
        .then(extract => {
          let updLabel = _.find(extract.extracted_items, ['label', label])
          let updValue = (updLabel && updLabel.value) || []
          updValue = Array.isArray(updValue) ? updValue : [updValue]
          res.send({ multi: {
            value: updValue
          } })
        })
    } else {
      res.sendStatus(200)
    }
  })
  .catch(err => {
    res.status(err.statusCode).send(err.error.message || `Unable to set value for ${label}!`)
  })
}

function makeFieldsFromPlan (planFields, extract) {
  return planFields.map(field => {
    let extractField = _.find(extract.extracted_items, ['label', field.label])
    if (extractField) {
      field.value = extractField.value
    }
    return field
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
