const rp = require('request-promise')

function get (user, id) {
  let uri = `${process.env.API_URL}/reviews`
  if (id) uri += `/${id}`

  let options = {
    uri,
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
