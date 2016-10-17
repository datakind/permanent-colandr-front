module.exports = {
  auth: require('./auth'),
  reviews: require('./reviews'),
  teams: require('./teams'),
  users: require('./users'),
  plans: require('./plans'),
  handleError: (cb) => {
    return (err) => {
      console.error('Error:', err)
      cb()
    }
  }
}
