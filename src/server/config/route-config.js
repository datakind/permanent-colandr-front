'use strict'

module.exports.init = function (app) {
  // *** routes *** //
  const routes = require('../routes/index')
  const authRoutes = require('../routes/auth')

  // *** register routes *** //
  app.use('/', routes)
  app.use('/', authRoutes)
}
