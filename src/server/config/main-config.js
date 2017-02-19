'use strict'

// *** main dependencies *** //
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('express-flash')
const morgan = require('morgan')
const nunjucks = require('nunjucks')
const favicon = require('serve-favicon')
const methodOverride = require('method-override')

// *** view folders *** //
const viewFolders = [
  path.join(__dirname, '..', 'views')
]

// *** load environment variables *** //
if (process.env.NODE_ENV !== 'production') require('dotenv').config()

module.exports.init = function (app, express) {
  // *** view engine *** //
  const nunjucksEnv = nunjucks.configure(viewFolders, {
    express: app,
    autoescape: true
  })
  nunjucksEnv.addFilter('date', require('nunjucks-date-filter'))
  nunjucksEnv.addFilter('containsElement', function (array, value) {
    console.log(array)
    console.log(value)
    if (array.indexOf(value) > -1) return true
    else return false
  })

  app.set('view engine', 'html')

  // *** app middleware *** //
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
  }

  app.use(favicon(path.join(__dirname, '..', '..', 'client', 'images', 'favicon.ico')))
  app.use(cookieParser())
  app.use(methodOverride('_method'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(flash())
  app.use(express.static(path.join(__dirname, '..', '..', 'client')))
  app.use('/pdfjs', express.static(path.join(__dirname, '..', '..', '..', 'third-party', 'pdfjs-dist')))
  app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: true
  }))

  // Make sure the session user is always available to templates.
  app.use(function (req, res, next) {
    res.locals.currentUser = req.session.user
    next()
  })
}
