const { send } = require('./helpers')

function getPrisma (body) {
  const { reviewId, user } = body
  const uri = `/reviews/${reviewId}/export/prisma`
  let req = send(uri, user)
  return req
}

module.exports = { getPrisma }
