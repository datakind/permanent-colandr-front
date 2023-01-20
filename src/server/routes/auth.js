const { send } = require('./api/helpers')
const bluebird = require('bluebird')
const router = require('express-promise-router')({ mergeParams: true })
const api = require('./api')


router.get('/signin', index)
router.get('/register/:token', register)
router.post('/signin', signin, api.auth.authenticate, goUserHome)
router.post('/signup', signup, signin)
/* new */
router.get('/logout', logout)

router.get('/reset/:token', reset)
router.get('/reset', reset)
router.post('/requestReset', requestReset)
router.post('/updatePassword/:token', updatePassword)

// auth routes

function captcharray(){
    // alphaNums contains the characters with which you want to create the CAPTCHA
let alphaNums = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
let emptyArr = [];
// This loop generates a random string of 7 characters using alphaNums
// Further this string is displayed as a CAPTCHA
for (let i = 1; i <= 7; i++) {
    emptyArr.push(alphaNums[Math.floor(Math.random() * alphaNums.length)]);
}
return emptyArr
}

function index (req, res, next) {
  emptyArr = captcharray()
req.session["captcha"]=emptyArr
console.log(req.session["captcha"])
  res.render('auth/index', { capcode: emptyArr})
}

function reset (req, res, next) {
  emptyArr = captcharray()
req.session["captcha"]=emptyArr
  res.render('auth/reset', {
    token: req.params.token,capcode: emptyArr
  })
}

/* new */
function logout (req, res, next) {
  req.session.destroy()
  res.redirect('/')
}

function signin (req, res, next) {
  console.log(String(req.session.captcha))
  
  formcaptchainput = req.body.CaptchaInput.split("")
  console.log(formcaptchainput)
  if (String(req.session.captcha) == String(formcaptchainput)) {
    console.log("This is the correct captcha")
    api.auth.signin(req.body)
    .then(token => {
      req.session.user = token
      console.log(token)
      next()
    })
    .catch(err => {
      console.log('Login failed: ' + err)
      req.flash('error', 'Could not login with the provided email and password')
      res.redirect('/signin#signin')
    })
  }
  else{
    req.flash('error', 'Double check your CAPTCHA spelling')
      res.redirect('/signin#signin')
  }
}

function register (req, res, next) {
  send(`/register/${req.params.token}`, '', { auth: null })
  .then(() => {
    req.flash('success', 'Congratulations, you have successfully registered!')
    res.redirect('/signin#signin')
  })
  .catch(err => {
    console.log('Register failed: ' + err)
    req.flash('error', 'Could not register user with provided credentials!')
    res.redirect('/signin#signin')
  })
}

function requestReset (req, res, next) {
  console.log(String(req.session.captcha))
  
  formcaptchainput = req.body.CaptchaInput.split("")
  console.log(formcaptchainput)
  if (String(req.session.captcha) == String(formcaptchainput)) {
  return bluebird.try(() => {
    if (!req.body.email) {
      throw new Error('Please provide a valid email address.')
    }
    return api.auth.requestReset(req.body.email)
  })
  .then(() => {
    req.flash('success', 'Password reset requested. Please check your email.')
    res.redirect('/signin')
  })
  .catch(err => {
    console.log('Password reset request failed: ' + err)
    req.flash('error', err.message)
    res.redirect('/reset')
  })
}
else{
  req.flash('error', 'Double check your CAPTCHA spelling')
    res.redirect('/reset')
}
}

function updatePassword (req, res, next) {
  return bluebird.try(() => {
    if (!req.body.password || req.body.password !== req.body.password_dup) {
      throw new Error('Passwords don\'t match')
    }
    return api.auth.submitReset(req.params.token, req.body.password)
  })
  .then(token => {
    req.session.user = token
    req.flash('success', 'Password updated. Please log in.')
    res.redirect('/signin#signin')
  })
  .catch(err => {
    console.log('Password reset failed: ' + err)
    let details = ': ' + err.message
    if (err.statusCode === 500) {
      details = ': invalid request.'
    } else {
      try {
        details = ': ' + err.error.messages.password.join('\n')
      } catch (e) {}
    }
    req.flash('error', 'Could not reset password' + details)
    res.redirect(`/reset/${req.params.token}`)
  })
}

function goUserHome (req, res, next) {
  res.redirect('/reviews')
}

function signup (req, res, next) {
  console.log(req.session.captcha)

  formcaptchainput = req.body.CaptchaInput.split("")
  console.log(formcaptchainput)
  if (String(req.session.captcha) == String(formcaptchainput)) {
    console.log("This is the correct captcha")
  api.auth.signup(req.body)
    .then(success => {
      req.flash('success', 'Thanks for signing up! Please check your email to confirm your account.')
      res.redirect('/signin#signin')
    })
    .catch(err => {
      console.log('Signup failed: ' + err)
      let details = ''
      if (/^duplicate key value violates unique constraint/.test(err.error.message)) {
        details = ': Email address already registered.'
      } else if (err.error.messages.password) {
        details = ': ' + err.error.messages.password.join('\n')
      }
      req.flash('error', 'Could not register with the provided information' + details)
      res.redirect('/signin#signup')
    })
}
else{
  req.flash('error', 'Double check your CAPTCHA spelling')
    res.redirect('/signin#signup')
}
}

module.exports = router
