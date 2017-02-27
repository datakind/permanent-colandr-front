const express = require('express')
const router = express.Router()

router.get('/', function (req, res, next) {
  if (req.session.user) {
    res.redirect('/reviews')
  } else {
    res.redirect('/signin')
  }
})

module.exports = router
