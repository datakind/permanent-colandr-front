const { send } = require('./helpers')

function getTags (body) {
  const { user, reviewId } = body
  const uri = `/studies/tags?review_id=${reviewId}`
  let req = send(uri, user)
  return req
}

module.exports = {
  getTags
}
