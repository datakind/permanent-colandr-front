const Promise = require('bluebird')
const router = require('express-promise-router')({ mergeParams: true })
const api = require('./api')
const { send } = require('./api/helpers')

router.get('/', api.populateBodyWithDefaults, render)
router.get('/prisma', api.populateBodyWithDefaults, getPrisma)
router.get('/studies', api.populateBodyWithDefaults, getStudies)

function render (req, res) {
  const { reviewId, user } = req.body

  api.reviews.getName(user, reviewId)
  .then(reviewName => {
    res.render('export/index', {
      reviewId,
      reviewName
    })
  })
}

function getPrisma (req, res) {
  return api.export.getPrisma(req.body)
  .then(prisma => {
    res.json(prisma)
  })
}

function getStudies (req, res) {
  const { reviewId, user } = req.body

  return Promise.join(
    send(`/reviews/${reviewId}/export/studies`, user),
    send(`/reviews/${reviewId}`, user),
    (exportData, review) => {
      res.type('csv')
      res.attachment(review.name + '.csv')
      res.send(new Buffer(exportData))
    })
}

module.exports = router
