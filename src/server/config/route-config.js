'use strict'

module.exports.init = function (app) {
  // *** routes *** //
  const routes = require('../routes/index')

  // *** register routes *** //
  app.use('/', routes)
}
