const { send } = require('./helpers')

function get (body, page = 1, status = 'pending', tsquery = '', orderBy = '', tag = '') {
  const { reviewId, user } = body
  const uri = '/studies'
  console.log('reviewId %s', reviewId)
  console.log('query %s', tsquery)
  let req = send(uri, user)
  let form = req.form()
  form.append('review_id', reviewId)
  form.append('fields', 'citation_status,citation.title,citation.abstract,citation.journal_name,citation.pub_year,citation.authors,citation.keywords,citation.screenings,tags')
  form.append('page', page - 1)
  form.append('per_page', 100)
  if (tsquery.length > 0) {
    form.append('tsquery', tsquery)
  }
  if (orderBy.length > 0) {
    form.append('order_by', orderBy)
  }
  if (tag.length > 0) {
    form.append('tag', tag)
  }
  console.log('status %s', status)
  form.append('citation_status', status)
  return req
}

function post (body) {
  console.log('review 1')
  const { reviewId, user, citationId, criteria, action } = body
  console.log('review 2')
  console.log(reviewId)
  console.log('review 3')
  console.log(citationId)
  console.log(action)
  console.log(criteria)
  console.log(user)
  const opts = { method: 'POST' }
  const uri = `/citations/${citationId}/screenings`
  console.log('uri %s', uri)
  let req = send(uri, user, opts)
  let form = req.form()
  form.append('status', action)
  if (action === 'excluded') {
    for (var criterion in criteria) {
      form.append('exclude_reasons', criterion)
    }
  }
  return req
}

function deleteCitation (body) {
  const { reviewId, user, citationId } = body
  console.log(reviewId)
  console.log('review 3')
  console.log(citationId)
  const opts = { method: 'DELETE' }
  const uri = `/citations/${citationId}/screenings`
  console.log('uri %s', uri)
  let req = send(uri, user, opts)
  return req
}

function addTags (citationId, body) {
  const { user, tags } = body
  var currentTags = tags
  console.log(currentTags)
  const putOpts = { method: 'PUT', body: { tags: currentTags } }
  console.log(citationId)
  const turi = `/studies/${citationId}`
  let treq = send(turi, user, putOpts)
  return treq
}

function getTags (body) {
  const { user, reviewId } = body
  const uri = `/studies/tags?review_id=${reviewId}`
  let req = send(uri, user)
  return req
}

module.exports = {
  get, post, getTags, addTags, deleteCitation
}
