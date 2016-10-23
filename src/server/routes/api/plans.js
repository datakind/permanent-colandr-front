const { send } = require('./helpers')

function get (body) {
  const { reviewId, user } = body
  return send(`/reviews/${reviewId}/plan`, user)
}

function update (body) {
  const { reviewId, user } = body
  return send(`/reviews/${reviewId}/plan`, user, { method: 'PUT', body })
}

module.exports = {
  get, update
}
