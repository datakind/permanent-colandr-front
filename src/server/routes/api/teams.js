const { send } = require('./helpers')

function get (user, reviewId) {
  return send(`/reviews/${reviewId}/team`, user)
}

module.exports = {
  get
}
