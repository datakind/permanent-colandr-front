const express = require('express')
const router = express.Router({ mergeParams: true })
const upload = require('multer')()
const api = require('./api')

router.get('/', api.populateBodyWithDefaults, showTextScreens);

function showTextScreens(req, res, next) {	

	let pageNum = req.params.page;
	if (pageNum === undefined) {
		pageNum = 1;
	}

	let orderBy = req.query.order_by;
	if (orderBy === undefined) {
		orderBy = 'relevance';
	}

	getProgress(req, () => getPlan(req, () => attachUsers(req, 
		() => api.citations
				.get(req.body, pageNum, req.params.status, req.query.tsquery, orderBy, req.query.tag)				
				.then((citations) => {
					let numberOfPages = Math.ceil(req.body.progress.citation_screening[req.params.status] / 50),
       					range = pageRange(pageNum, numberOfPages);

					const ftxtObj = {						
						reviewId: req.body.reviewId, 
						fulltextProgress: req.body.progress.fulltext_screening,
						selectionCriteria: req.body.plan.selection_criteria, 
						studies: citations, 
          				page: pageNum,
          				numPages: numberOfPages, 
          				range: range, 
          				shownStatus: req.params.status, 
				        order_by: orderBy, 
				        tsquery: req.query.tsquery, 
				        tag: req.query.tag, 
				        users: req.body.users, 
				        userId: req.body.user.user_id
					};

					console.log(req.body.progress.fulltext_screening);
					console.log(citations.length);

					res.render('fullTextScreening/show', ftxtObj);
				})
			)// attachUsers
		)// getPlan
	);// getProgress			
	
}

function getProgress (req, next) {
  api.progress.get(req.body, 'True')
    .then(progress => {
      req.body.progress = progress
      next()
    })
}

function getPlan (req, next) {
  api.plans.get(req.body)
    .then(plan => {
      req.body.plan = plan
      next()
    })
}

function attachUsers (req, next) {
  api.users.getTeam(req.body.user, req.body)
    .then(users => {
      var userMap = {}
      for (var i = 0; i < users.length; i++) {
        userMap[users[i].id] = users[i].name
      }
      req.body.users = userMap
      next()
    })
}

function pageRange (pageNum, numPages) {
  var endpoint = Math.min(Math.max(parseInt(pageNum) + 5, 11), numPages)
  var pageNav = []
  for (var i = Math.max(parseInt(pageNum) - 5, 1); i < endpoint; i++) {
    pageNav.push(i)
  }
  return pageNav
}

module.exports = router

