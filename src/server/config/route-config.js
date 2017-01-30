'use strict'

module.exports.init = function (app) {
  // *** auth *** //
  const { auth } = require('../routes/api')

  // *** routes *** //
  const routes = require('../routes/index')
  const authRoutes = require('../routes/auth')
  const reviewsRoutes = require('../routes/reviews')
  const teamsRoutes = require('../routes/teams')
  const plansRoutes = require('../routes/plans')
  const citationsRoutes = require('../routes/citations')
  const fulltextRoutes = require('../routes/fulltext')

  // *** register routes *** //
  app.use('/', routes)
  app.use('/', authRoutes)

  app.use(auth.authenticate)
  app.use('/reviews', reviewsRoutes)
  app.use('/reviews/:reviewId/team', teamsRoutes)
  app.use('/reviews/:reviewId/plan', plansRoutes)
  app.use('/reviews/:reviewId/citations', citationsRoutes)
  app.use('/reviews/:reviewId/fulltext', fulltextRoutes)
}
