const { send } = require('./helpers')

function create (body, { uploaded_file: [file] }) {
  const { studyId, user } = body
  const opts = { method: 'POST' }
  let request = send(`/fulltexts/${studyId}/upload`, user, opts)
  let form = request.form()
  form.append('id', studyId)
  form.append('uploaded_file', file.buffer.toString(), {
    filename: file.originalname,
    contentType: file.mimetype
  })
  return request
}

function post (body) {
  console.warn('POST BODY', body)
  const { user, studyId, criteria, action } = body
  const opts = { method: 'POST' }
  const uri = `/fulltexts/${studyId}/screenings`
  console.log('uri %s', uri)
  let req = send(uri, user, opts)
  let form = req.form()
  form.append('status', action)
  if (action === 'excluded') {
    for (var criterion in criteria) {
      form.append('exclude_reasons', criterion)
    }
  }
  return req
}

function deleteFulltext (body) {
  const { reviewId, user, studyId } = body
  console.log(reviewId)
  console.log('review 3')
  console.log(studyId)
  const opts = { method: 'DELETE' }
  const uri = `/fulltexts/${studyId}/screenings`
  console.log('uri %s', uri)
  let req = send(uri, user, opts)
  return req
}

module.exports = { create, post, deleteFulltext }
