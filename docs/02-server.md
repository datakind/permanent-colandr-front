## Server Side

This doc will tell you how to do the following:

1. Create new views (HTML)
1. Add new routes to server up views
1. Create new connections between this server and the API
1. Update the configuration files


### Creating New Views

All views are created using [Nunjucks](https://mozilla.github.io/nunjucks/) for templating. Views live in the [server/views folder](../src/server/views) and are separated according to resource name. The shared folder contains things that transcend all resources, for example the navbar.

All pages have a base template they extend. The smaller, more manageable template files then appear inside that base file. For example, take a look at the following commented code:

```html
<!--
  Looks for a _base.html file in the main views/ folder and place
  all of this content inside of it.
-->
{% extends "_base.html" %}

<!--
  Inside the _base.html, you'll find a similar section of code. The code
  placed between `block` and `endblock` will appear in that section. In this
  case, we're adding specific stylesheets to a specific page.
-->
{% block css %}
  <link rel="stylesheet" href="/css/reviews.css">
{% endblock %}

<!--
  The following code, like that above, will appear inside the `block`
  labeled content.
-->
{% block content %}

  <div class="reviews reviews-page container">
    <div class="row">
      <div class="col s6">
        <h1>My Reviews</h1>
      </div>
      <div class="col s6">
        <p>
          <a href="/reviews/new">
            <button class="btn btn-large right z-depth-0">New Review</button>
          </a>
        </p>
      </div>
    </div>
    <hr>
    <div class="reviews-list">
      <!-- `include` will bring in a partial to be rendered here. -->
      {% include '../shared/notifications.html' %}
      <!--
        Nunjucks allows for some simple logic and for loops. The `review` variable will be available in the `review-listing.html` partial and
        will repeat for however many reviews there are.
      -->
      {% for review in reviews %}
        {% include './partials/review-listing.html' %}
      {% endfor %}
    </div>
  </div>

{% endblock %}
```

This makes it very easy to split up your HTML into smaller chunks.

---

### Adding New Routes

All routing lives, helpfully, in the [server/routes folder](../src/server/routes). Express routing will all start with the same boilerplate code:

```js
const express = require('express')
const router = express.Router()

// your routes go here

module.exports = router
```

These files are connected in the [route-config.js](../src/server/config/route-config.js) file with the `require` statement. For example:

```js
// Requires all the routes from the following file paths. Note that
// the .js extension is missing but is automatically added by Express.
const routes = require('../routes/index')
const reviewsRoutes = require('../routes/reviews')

// Connect those routes with the application.
app.use('/', routes)
// In this case, every route inside of the '../routes/reviews' file will
// be prefixed with '/reviews'.
app.use('/reviews', reviewsRoutes)
```

For example, let's take a look at some code that will generate the route that allows us to get the new review page. Assume it is in the above reviews route file.

```js
const express = require('express')
const router = express.Router()

// Create a new route at the /new path and use the newReview function
// to decide what will happen. Given the above prefix, the full path
// would actually be at /reviews/new.
router.get('/new', newReview)

// A function that determines how the server will respond. `req` is information
// from the request, while `res` is information on response. `next` is a
// function that calls another function before responded. For more information
// on `next`, I'd read up on the Express documentation.
function newReview (req, res, next) {
  // Create a new, empty object to pass down to the view.
  let review = {}
  // `res.render` will show show template file and -- surprise! -- render it.
  // In this case, we look inside views/reviews for a file called new.html. It
  // will pass down a variable accessible to the view called review which,
  // at the moment, will contain an empty object.
  res.render('reviews/new', { review })
}

module.exports = router
```

#### Example

Let's say you wanted to create a new page and a new route file, for example `/about`. I'd first go to `/views` folder and create a new folder called `home`. I'd then create and `about.html` inside there that might look like this:

```html
{% extends '_base.njk' %}

{% block content %}

  <div class="row">
    <div class="col-md-12">
      <h1>Welcome to the {{ title }} page!</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit...
      </p>
    </div>
  </div>

{% endblock %}
```

Then, create a new file in `/routes` called `home.js` with the following code:

```js
const express = require('express')
const router = express.Router()

router.get('/about', function (req, res, next) {
  let title = 'About'
  res.render('home/about', { title })
})

module.exports = router
```

Finally, go to `route-config.js` and add the following:

```js
const homeRoutes = require('../routes/home')

// ...

app.use('/', homeRoutes)
```

---

### New API Routes

Building the API routes is a bit more complex and will require some knowledge of [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and, if you use the existing code as your guide, [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions). Each API call follows the same format so once you've gotten a few done, it should be relatively simple.

Let's start in a routing file:

```js
function index (req, res, next) {
  api.plans.get(req.body)
    .then(plan => res.render('plans/index', { plan }))
    .catch(api.handleError(next))
}
```

The format we see inside the index function says the following:

1. Call the `api.plans.get` method -- which hits the API -- and pass it `req.body`
1. Then, with the information that gets returned, render the `plans/index` page with the local variable `plan`.
1. If something goes wrong, catch the error with the `api.handleError` function.

For most queries, you should essentially be able to copy and paste this format with the following variables being changed (look for the all caps):

```js
function index (req, res, next) {
  api.RESOURCE.get(req.body)
    .then(ANY_VAR_NAME => res.render('SOME/PATH', { ANY_VAR_NAME }))
    .catch(api.handleError(next))
}
```

You'll need to hit the API whenever you need to return data from the database. After setting up this format with your route, take a look at the [routes/api/index.js](../src/server/routes/api/index.js) file. Here you'll see a list of the resources the API has access to. All these `require` statements simply reference the other files in this folder! Let's take a look at one of those files with some comments:

```js
// This pulls in a helper method to send along requests to the API.
// The helpers.js file includes documentation on what is happening
// internally with that function.
const { send } = require('./helpers')

// Define a function called `get`. Above, we saw `api.plans.get`. This is
// where the .get comes from.
function get (body) {
  // Pull out the reviewId and user keys from the body object (a.k.a a dict)
  const { reviewId, user } = body
  // Return a promised request to the following endpoint. Here we use
  // string interpolation to substitute the value of reviewId inside the
  // route (e.g. /reviews/1/plan) and pass along the user information
  // for authorization purposes
  return send(`/reviews/${reviewId}/plan`, user)
}

// Define a function called `update`. The corollary to the above example would
// be `api.plans.update`.
function update (body) {
  // Pull out the reviewId and user keys from the body object
  const { reviewId, user } = body
  // Return a promised request to the following endpoint, just like above.
  // The difference here is that we've passed an optional third argument
  // that has additional information. In this case we've specified the
  // method (by default it is a GET) and passed along the entire body
  // which is necessary for updating our resource.
  return send(`/reviews/${reviewId}/plan`, user, { method: 'PUT', body })
}

// Export the above get and update methods out of this file. You'll likely
// always want to include whatever you create above inside the object below.
module.exports = {
  get, update
}
```

That's about it. Whatever gets returned from the API will be available to you as the parameter in the `.then` method which can then be passed along to the view or ignored on a redirect.

---

### Updating the Configuration Files

The only files we really haven't touched at all are:

* [app.js](../src/server/app.js)
* [server.js](../src/server/server.js)
* [config/error-config.js](../src/server/config/error-config.js)
* [config/main-config.js](../src/server/config/main-config.js)

You shouldn't need to touch either of these much, but I'll provide a brief explanation of each.

#### app.js

This file simply pulls together all the other configuration files. I really can't imagine what you'd need to do in here although this file is crucial!

#### server.js

This is the file that actually runs the server. If you wanted to change the default port or change the error messages displayed on startup, you could edit this file.

#### config/error-config.js

In the event there's an error, this file handles it. You could change this to redirect to a 404 page instead of displaying a text error page.

#### config/main-config.js

This file loads a number of the packages that are needed for this application to run. If you were doing something substantially different with the application or needed to add a dependency, you may need to work with this file.
