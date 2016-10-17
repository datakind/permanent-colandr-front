const { send } = require('./helpers')

function get (user, reviewId) {
  return send(`/reviews/${reviewId}/plan`, user)
}

module.exports = {
  get
}
