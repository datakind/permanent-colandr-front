## Colandr Front-End

* [Setup](../readme.md)
* [Configuration Files](./01-configuration.md)
* [Server Files](./02-server.md)


### Summary

The Front-End application was designed to be a first draft at building a user experience for Colandr's Python API. The goal was to build a quick, middleman server to communicate between the API and the user.

It is built with the following technologies (beyond the basics):

* **Front-End:** [SCSS](http://sass-lang.com/), [jQuery](https://jquery.com/), and [Materialize](http://materializecss.com/)
* **Back-End:** [Nunjucks](https://mozilla.github.io/nunjucks/), [Node](https://nodejs.org/), and [Express](http://expressjs.com/)
* **Build Tools:** [NPM](https://www.npmjs.com), [Gulp](http://gulpjs.com/), and [ESLint](http://eslint.org/)

This repository has an [API Guide](./api-guide.html) and some [mockups](../mockups/colandr-1.pdf).


### Moving Forward

As this was built to produce quickly, a separate server was created to interact with the existing API. Moving forward, I would suggest a Front-End Framework like [AngularJS](https://angularjs.org/) or [React](https://facebook.github.io/react/). An application like this would be lighter and like faster but will take a bit more time to build well. As the project is now, it's pretty possible for anyone with some development experience to jump in and add a page or two -- at least, I hope!

I have done my best to document everything someone just getting started would need to know but I'm sure I've forgotten something. Although my outside time is limited, please feel free to contact me for clarifying questions!

> **Wes Reid**

> email: bwreid@gmail.com

> github: bwreid


### Todos

There are many todos! But here are some high-level ones:

1. Correctly forward errors to an error page
1. Add more user feedback via `req.flash` and jQuery messages
1. Manage tokens more thoroughly
