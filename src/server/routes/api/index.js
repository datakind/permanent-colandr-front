module.exports = {
  auth: require('./auth'),
  reviews: require('./reviews'),
  teams: require('./teams'),
  handleError: (cb) => {
    return (err) => {
      console.error('Error:', err)
      cb()
    }
  }
}
