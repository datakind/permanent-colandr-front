const bluebird = require('bluebird')
const router = require('express-promise-router')({ mergeParams: true })
const api = require('./api')

router.get('/', index)
router.get('/new', newReview)
router.get('/:id', show)
router.get('/:id/settings', settings)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', del)

// reviews routes

function index (req, res) {
  return bluebird.map(api.reviews.get(req.session.user, null, req.query), review => {
    return api.teams.get(req.session.user, review.id)
    .then(team => {
      review.team = team.filter(member => member.id !== req.session.user.user_id)
      return review
    })
  })
  .then(reviews => res.render('reviews/index', { reviews }))
}

function newReview (req, res, next) {
  let review = {}
  res.render('reviews/new', { review })
}

function show (req, res, next) {
  return bluebird.join(
    api.reviews.get(req.session.user, req.params.id),
    api.progress.get({reviewId: req.params.id, user: req.session.user}, true),
    (review, progress) => {
      let planDisplay = [
        {title: 'objective', route: 'objective'},
        {title: 'questions', route: 'research-questions'},
        {title: 'pico', route: 'pico'},
        {title: 'key terms', route: 'keyterms'},
        {title: 'selection criteria', route: 'selection-criteria'},
        {title: 'extraction form', route: 'data-extraction-form'}]
      let progressDisplay = [
        {title: 'unscreened', route: 'pending'},
        {title: 'awaiting', route: 'awaiting_coscreener'},
        {title: 'conflict', route: 'conflict'},
        {title: 'excluded', route: 'excluded'},
        {title: 'included', route: 'included'}
      ]
      progressDisplay.forEach(item => {
        item.citation_count = progress.citation_screening[item.route]
        item.fulltext_count = progress.fulltext_screening[item.route]
      })
      let extractProgress = [
        { title: 'not started', route: 'not_started', count: progress.data_extraction.not_started },
        { title: 'started', route: 'started', count: progress.data_extraction.started },
        { title: 'finished', route: 'finished', count: progress.data_extraction.finished }
      ]
      res.render('reviews/show', {
        reviewId: review.id,
        reviewName: review.name,
        review: review,
        progress: progressDisplay,
        plan: planDisplay,
        extractProgress
      })
    }
  )
  .catch(api.handleError(next))
}

function settings (req, res, next) {
  return bluebird.join(
    api.reviews.get(req.session.user, req.params.id),
    api.teams.get(req.session.user, req.params.id),
    (review, team) => {
      res.render('reviews/settings', {
        reviewId: review.id,
        reviewName: review.name,
        isOwner: req.session.user.user_id === review.owner_user_id,
        review,
        team
      })
    }
  )
  .catch(api.handleError(next))
}

function create (req, res, next) {
  api.reviews.create(req.session.user, req.body)
    .then(review => {
      req.flash('success', `${review.name} has been created!`)
      res.redirect('/reviews')
    })
    .catch(api.handleError(next))
}

function update (req, res, next) {
  let { id } = req.params
  req.body.id = id

  api.reviews.update(req.session.user, req.body)
    .then(review => {
      req.flash('success', `Update successful!`)
      res.redirect(`/reviews/${id}/settings`)
    })
    .catch(api.handleError(next))
}

function del (req, res, next) {
  api.reviews.del(req.session.user, req.params.id)
    .then(() => res.redirect('/reviews'))
    .catch(api.handleError(next))
}

module.exports = router
