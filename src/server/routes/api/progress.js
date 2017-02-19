const { send } = require('./helpers')

function get (body, userView = 'False', step = undefined) {
  const { reviewId, user } = body
  const uri = `/reviews/${reviewId}/progress`
  console.log('api/progress uri %s', uri)
  return send(uri, user, { qs: {
    user_view: userView,
    step: step
  }})
}

module.exports = {
  get
}
