const router = require('express-promise-router')({ mergeParams: true })

router.get('/', function (req, res, next) {
  if (req.session.user) {
    res.redirect('/reviews')
  } else {
    res.redirect('/signin')
  }
})

module.exports = router
