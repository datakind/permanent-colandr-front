const rp = require('request-promise')

function get (user, reviewId) {
  let uri = `${process.env.API_URL}/reviews/${reviewId}/team`

  let options = {
    uri,
    json: true,
    auth: { user: user.token }
  }

  return rp(options)
}

module.exports = {
  get
}
