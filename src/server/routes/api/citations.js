const { send } = require('./helpers')

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
  getTags, addTags
}
