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
  const opts = { method: 'POST' }
  // const putOpts = { method: 'PUT' }
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
  const putOpts = { method: 'PUT' }
  const { user, tags } = body
  var currentTags = tags
  console.log(citationId)
  console.log(currentTags)
  console.log('tags %s', JSON.stringify(currentTags))
  const turi = `/studies/${citationId}`
  let treq = send(turi, user, putOpts)
  let tform = treq.form()
  tform.append('tags', JSON.stringify(currentTags))
  return treq
}

module.exports = {
  get, post, addTags, deleteCitation
}
