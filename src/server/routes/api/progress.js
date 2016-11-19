const { send } = require('./helpers')

function get (body) {
  const { reviewId, user } = body
  const uri = `/reviews/${reviewId}/progress`
  console.log('reviewId %s', reviewId)
  console.log('uri %s', uri)
  let req = send(uri, user)
  return req
}

module.exports = {
  get
}
