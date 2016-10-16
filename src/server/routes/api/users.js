const { send } = require('./helpers')

function get (user, body) {
  const queryString = { qs: body }
  return send(`/users`, user, queryString)
}

module.exports = {
  get
}
