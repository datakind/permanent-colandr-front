const rp = require('request-promise')

function signin (body) {
  console.log(body)
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

module.exports = {
  signin
}
