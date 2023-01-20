const { send } = require('./helpers')

function get (user, body) {
  const queryString = { qs: body }
  return send(`/users`, user, queryString)
}

function getTeam (user, body) {
  var queryString = `/users?review_id=${body.reviewId}`
  return send(queryString, user)
}

module.exports = {
  get, getTeam
}
