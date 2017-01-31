'use strict'

// *** error handling *** //

module.exports.init = function (app) {
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  let development = (app.get('env') === 'development')

  // production error handler (no stacktraces leaked to user)
  app.use(function (err, req, res, next) {
    if (err.statusCode === 401) {
      console.log('Error processing request:', err.toString())
      req.session.user = null
      req.flash('error', (err.error || err).message)
      res.redirect('/signin#signin')
    } else {
      res.status(err.status || 500)
      .send({
        message: err.message,
        // Show stacktraces in development but don't leak to user in production.
        error: development ? err : {}
      })
    }
  })
}
