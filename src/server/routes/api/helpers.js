const rp = require('request-promise')

// Send makes a request to the API URL specified.
// You *must* include a path and a user and may
// optionally include an options object which will
// include keys like 'method', 'auth', and 'body'
// For example:
//  return send('/reviews', user, { method: 'POST' })

function send (path, user, opts = {}) {
  const uri = process.env.API_URL + path
  const options = Object.assign({
    uri,
    json: true,
    auth: { user: user.token }
  }, opts)

  console.log('RP', JSON.stringify(options))
  return rp(options)
}

module.exports = { send }
