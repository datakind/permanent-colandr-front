const rp = require('request-promise')

function get (user) {
  let options = {
    uri: `${process.env.API_URL}/reviews`,
    json: true,
    auth: { user: user.token }
  }

  return rp(options)
}

function create (user, body) {
  let options = {
    method: 'POST',
    uri: `${process.env.API_URL}/reviews`,
    json: true,
    auth: { user: user.token },
    body
  }

  return rp(options)
}

module.exports = {
  get, create
}
