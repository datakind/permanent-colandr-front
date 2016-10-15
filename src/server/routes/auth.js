const express = require('express')
const router = express.Router()

router.get('/signin', function (req, res, next) {
  res.render('auth/index', {})
})

module.exports = router
