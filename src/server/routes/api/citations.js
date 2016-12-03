const { send } = require('./helpers')

function get (body, page = 1, status = 'pending') {
  const { reviewId, user } = body
  const uri = '/studies'
  console.log('reviewId %s', reviewId)
  let req = send(uri, user)
  let form = req.form()
  form.append('review_id', reviewId)
  form.append('fields', 'citation_status,citation.title,citation.abstract,citation.journal_name,citation.pub_year,citation.authors,citation.keywords,citation.screenings')
  form.append('page', page-1)
  form.append('per_page', 10)
  console.log('status %s', status)
  form.append('citation_status', status)
  return req
}

function post (body) {
  console.log('review 1')
  const { reviewId, user, citation, status, criteria } = body
  console.log('review 2')
  console.log()
  var statusKey = Object.keys(status)[0]
  console.log('review 3')
  console.log(reviewId)
  console.log(citation)
  console.log(statusKey)
  console.log(criteria)
  const opts = { method: 'POST' }
  for (var citationId in citation) {
    const uri = `/citations/${citationId}/screenings`
    console.log('uri %s', uri)
    let req = send(uri, user, opts)
    let form = req.form()
    form.append('status', statusKey)
    if (statusKey === 'excluded') {
      var excluded = criteria[citationId]
      for (var i = 0; i < excluded.length; i++) {
        form.append('exclude_reasons', excluded[i])
      }
    }
    req.then(res =>
      console.log(res))
  }
}

module.exports = {
  get, post
}
