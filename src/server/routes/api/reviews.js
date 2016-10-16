const { send } = require('./helpers')

function get (user, id) {
  const uri = (id) ? `/reviews/${id}` : '/reviews'
  return send(uri, user)
}

function create (user, body) {
  return send('/reviews', user, { method: 'POST', body })
}

function update (user, body) {
  const { id } = body
  delete body.id

  return send(`/reviews/${id}`, user, { method: 'PUT', body })
}

function del (user, id) {
  return send(`/reviews/${id}`, user, { method: 'DELETE' })
}

module.exports = {
  get, create, update, del
}
