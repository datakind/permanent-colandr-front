const { send } = require('./helpers')

function get (body) {
  const { reviewId, user } = body
  return send(`/citations/imports?review_id=${reviewId}`, user)
}

function create (body, { uploaded_file: [file] }) {
  const { reviewId, user, files } = body
  const opts = { method: 'POST' }
  let request = send(`/citations/imports?review_id=${reviewId}`, user, opts)
  let form = request.form()

  form.append('uploaded_file', file.buffer.toString(), {
    filename: file.originalname,
    contentType: file.mimetype
  })

  return request
}

module.exports = {
  get, create
}
