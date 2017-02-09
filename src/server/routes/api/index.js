module.exports = {
  auth: require('./auth'),
  reviews: require('./reviews'),
  progress: require('./progress'),
  citations: require('./citations'),
  teams: require('./teams'),
  users: require('./users'),
  plans: require('./plans'),
  imports: require('./imports'),
  fulltext: require('./fulltext'),
  export: require('./export'),
  handleError: (cb) => {
    return (err) => {
      console.error('Error:', err.message)
      cb(err)
    }
  },
  populateBodyWithDefaults: (req, res, next) => {
    const { reviewId } = req.params
    const { user } = req.session

    req.body.user = user
    req.body.reviewId = reviewId

    next()
  }
}
