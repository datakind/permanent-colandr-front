const { send } = require('./helpers')

function get (body, userView = 'False') {
  const { reviewId, user } = body
  const uri = `/reviews/${reviewId}/progress?user_view=${userView}`
  console.log('reviewId %s', reviewId)
  console.log('uri %s', uri)
  let req = send(uri, user)
  return req
}

module.exports = {
  get
}
