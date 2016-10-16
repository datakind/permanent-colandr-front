const { send } = require('./helpers')

function get (user, reviewId) {
  return send(`/reviews/${reviewId}/team`, user)
}

function update (user, reviewId, body) {
  return send(`/reviews/${reviewId}/team`, user, { method: 'PUT', body })
}

module.exports = {
  get, update
}
