const router = require('express-promise-router')({ mergeParams: true })

router.get('/', index)

function index (req, res, next) {
  res.render('about/index', {})
}

module.exports = router
