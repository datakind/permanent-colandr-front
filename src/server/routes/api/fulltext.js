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

module.exports = { create }
