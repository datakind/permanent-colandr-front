const { send } = require('./helpers')

function create (body, files) {
  const { studyId, user } = body
  let fileInfo = files.uploaded_file[0]
  let request = send(`/fulltexts/${studyId}/upload`, user, {
    method: 'POST'
  })
  let form = request.form()
  form.append('uploaded_file', fileInfo.buffer, {
    filename: fileInfo.originalname,
    contentType: fileInfo.mimetype
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
