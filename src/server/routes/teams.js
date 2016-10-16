const express = require('express')
const router = express.Router({ mergeParams: true })
const api = require('./api')

router.put('/invite', invite)
router.put('/remove', modify('remove'))
router.put('/promote', modify('make_owner'))

// reviews routes

function invite (req, res, next) {
  const { reviewId } = req.params
  const { user } = req.session
  api.users.get(user, req.body)
    .then(member => {
      const action = { user_id: member.id, action: 'add' }
      return api.teams.update(user, reviewId, action)
    })
    .then(reviews => res.redirect(`/reviews/${reviewId}/settings`))
    .catch(api.handleError(next))
}

function modify (action) {
  return (req, res, next) => {
    const { reviewId } = req.params
    const { user } = req.session
    const { user_id } = req.body
    const body = { user_id, action }

    api.teams.update(user, reviewId, body)
      .then(reviews => res.redirect(`/reviews/${reviewId}/settings`))
      .catch(api.handleError(next))
  }
}

module.exports = router
