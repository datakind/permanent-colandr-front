const router = require('express-promise-router')({ mergeParams: true })

router.get('/', index)

function index (req, res, next) {
  res.render('privacy-policy/index', {})
}

module.exports = router
