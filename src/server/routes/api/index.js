module.exports = {
  auth: require('./auth'),
  reviews: require('./reviews'),
  teams: require('./teams'),
  users: require('./users'),
  plans: require('./plans'),
  imports: require('./imports'),
  handleError: (cb) => {
    return (err) => {
      console.error('Error:', err)
      cb()
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
