module.exports = {
  auth: require('./auth'),
  reviews: require('./reviews'),
  handleError: (cb) => {
    return (err) => {
      console.error('Error:', err)
      cb()
    }
  }
}
