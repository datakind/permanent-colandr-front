const { send } = require('./helpers')

function get (body) {
  const { reviewId, user } = body
  const uri = '/studies'
  console.log('reviewId %s', reviewId)
  let req = send(uri, user)
  let form = req.form()
  form.append('review_id', reviewId)
  form.append('fields', 'citation_status,citation.title,citation.abstract,citation.keywords')
  return req
}

function post (body) {
  const { reviewId, user, screen, status } = body
  var status_key = Object.keys(status)[0]
  console.log(screen)
  console.log(status_key)
  const opts = { method: 'POST' }
  for(var citationId in screen){
  	  const uri = `/citations/${citationId}/screenings`
  	  console.log('uri %s', uri)
  	  let req = send(uri, user, opts)
	  let form = req.form()
	  form.append('status', status_key)
	  req.then( res => 
	  	console.log(res))
  }
}

module.exports = {
  get, post
}
