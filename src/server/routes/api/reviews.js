const { send } = require('./helpers')

function get (user, id, params) {
  const uri = (id) ? `/reviews/${id}` : '/reviews'
  return send(uri, user, { qs: params })
}

function getName (user, reviewId) {
  return send(`/reviews/${reviewId}`, user, {qs: {fields: 'name'}})
  .then(data => data.name)
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
  get, getName, create, update, del
}
