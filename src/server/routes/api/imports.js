const { send } = require('./helpers')

function get (body) {
  const { reviewId, user } = body
  return send(`/citations/imports?review_id=${reviewId}`, user)
}

function create (body, { uploaded_file: [file] }) {
  const { reviewId, user } = body
  const opts = { method: 'POST' }
  let request = send(`/citations/imports`, user, opts)
  let form = request.form()
  form.append('uploaded_file', file.buffer.toString(), {
    filename: file.originalname,
    contentType: file.mimetype
  })
  form.append('review_id', reviewId)
  form.append('source_type', body.source_type)
  form.append('source_name', body.source_name)
  if (body.source_url.length > 0) {
    form.append('source_url', body.source_url)
  }
  form.append('status', body.status)

  return request
}

module.exports = {
  get, create
}
