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

function update (user, body) {
  let { id } = body
  delete body.id

  let options = {
    method: 'PUT',
    uri: `${process.env.API_URL}/reviews/${id}`,
    json: true,
    auth: { user: user.token },
    body
  }

  return rp(options)
}

function del (user, id) {
  let options = {
    method: 'DELETE',
    uri: `${process.env.API_URL}/reviews/${id}`,
    json: true,
    auth: { user: user.token }
  }

  return rp(options)
}

module.exports = {
  get, create, update, del
}
