const rp = require('request-promise')

function signin (body) {
  let { email, password } = body
  if (!(email && password)) return Promise.reject()

  let options = {
    uri: `${process.env.API_URL}/authtoken`,
    json: true,
    auth: {
      user: email,
      pass: password,
      sendImmediately: false
    }
  }

  return rp(options)
}

function signup (body) {
  let { name, email, password } = body
  if (!(name && email && password)) return Promise.reject()

  let options = {
    method: 'POST',
    uri: `${process.env.API_URL}/register`,
    json: true,
    body: { name, email, password }
  }

  return rp(options)
}

module.exports = {
  signin, signup
}
