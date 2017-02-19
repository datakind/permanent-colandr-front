const { send } = require('./helpers')

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
  post, getTags, addTags, deleteCitation
}
