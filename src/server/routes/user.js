const bluebird = require('bluebird')
const router = require('express-promise-router')({ mergeParams: true })
const _ = require('lodash')
const api = require('./api')
const { send } = require('./api/helpers')

router.get('/', getUserInfo)
router.post('/update-info', updateInfo)
router.post('/update-password', updatePassword)
router.post('/delete-user', deleteUser)

function getUserInfo (req, res) {
  let user = req.session.user
  return send(`/users/${user.user_id}`, user)
  .then(userInfo => res.render('user/index', { user: userInfo }))
}

function updateSession (req, res, user, newUserInfo) {
  Object.assign(user, _.pick(newUserInfo, ['name', 'email']))
  req.session.user = user
  res.locals.currentUser = user
}

function updateInfo (req, res) {
  let user = req.session.user
  return send(`/users/${user.user_id}`, user, {
    method: 'PUT',
    body: _.pick(req.body, ['name', 'email'])
  })
  .then(userInfo => {
    updateSession(req, res, user, userInfo)
    req.flash('success', 'User info saved.')
    res.redirect('/user')
  })
}

function updatePassword (req, res) {
  let user = req.session.user
  return bluebird.try(() => {
    if (!req.body.password || req.body.password !== req.body.password_dup) {
      throw new Error('Passwords don\'t match')
    }
    // Validate the old password by signing in with it.
    return api.auth.signin({ email: user.email, password: req.body.password_old })
    .catch(() => { throw new Error('Old password isn\'t right') })
  })
  .then(() => {
    return send(`/users/${user.user_id}`, user, {
      method: 'PUT',
      body: _.pick(req.body, ['password'])
    })
    .catch(err => {
      let details = ''
      try {
        details = ': ' + err.error.messages.password.join('\n')
      } catch (e) {}
      throw new Error('Password change failed' + details)
    })
  })
  .then(userInfo => {
    updateSession(req, res, user, userInfo)
    req.flash('success', 'Password updated.')
  })
  .catch(err => req.flash('error', err.message))
  .then(() => res.redirect('/user'))
}

function deleteUser (req, res) {
  let user = req.session.user
  return send(`/users/${user.user_id}`, user, { method: 'DELETE' })
  .then(() => {
    req.session.destroy()
    req.flash(`User ${user.name} deleted`)
    res.redirect('/signin')
  })
}

module.exports = router
