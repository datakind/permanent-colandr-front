const bluebird = require('bluebird')
const _ = require('lodash')
const router = require('express-promise-router')({ mergeParams: true })
const { send } = require('./api/helpers')

// All these routes are under /study/:studyId
router.post('/screening/citation/submit', forwardAPI('/citations/:studyId/screenings', 'PUT-POST', ['status', 'exclude_reasons']))
router.post('/screening/citation/delete', forwardAPI('/citations/:studyId/screenings', 'DELETE'))
router.post('/screening/fulltext/submit', forwardAPI('/fulltexts/:studyId/screenings', 'PUT-POST', ['status', 'exclude_reasons']))
router.post('/screening/fulltext/delete', forwardAPI('/fulltexts/:studyId/screenings', 'DELETE'))
router.post('/tags', forwardAPI('/studies/:studyId', 'PUT', ['tags']))

function forwardAPI (apiURL, method, optFields) {
  return function (req, res) {
    const body = optFields ? _.pick(req.body, optFields) : {}
    const url = apiURL.replace(/:studyId\b/g, req.params.studyId)
    return bluebird.try(() => {
      if (method === 'PUT-POST') {
        // It's sometimes hard to know whether there is an existing screening by the current user,
        // which must be modified by PUT, or if it's new (POST). This pseudo-method tries both, which
        // makes client-side code simpler. (It would be nice if backend offered a single method.)
        return send(url, req.session.user, { method: 'PUT', body: body })
        .catch(e => (e.statusCode === 404),
          () => send(url, req.session.user, { method: 'POST', body: body }))
      } else {
        return send(url, req.session.user, { method: method, body: body })
      }
    })
    .then(data => {
      res.json(data || {})
    })
    .catch(e => {
      console.log(`${method} to ${url} failed: ${e}`)
      res.status(e.statusCode)
      res.json({ error: e.error.message || e.toString() })
    })
  }
}

module.exports = router
