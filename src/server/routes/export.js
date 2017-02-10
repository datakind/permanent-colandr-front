const router = require('express-promise-router')({ mergeParams: true })
const api = require('./api')

router.get('/', api.populateBodyWithDefaults, render)
router.get('/prisma',
  api.populateBodyWithDefaults,
  getPrisma)

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

function getPrisma (req, res, next) {
  return api.export.getPrisma(req.body)
  .then(prisma => {
    res.json(prisma)
  })
}

module.exports = router
