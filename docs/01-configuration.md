## Configuration

**Note**: _For setup information, visit the main [readme](../readme.md)._

This doc describes those files at the root folder of this project; in particular, the build tools used for development and deploying the project.


### .env.sample

Begin by making a new copy of the file:

```shell
# From this repository's root directory
cp .env.sample .env
```

Then, you'll need to change all the values:

* `API_URL`: The URL you'll be hitting for the API with no trailing slash. For example, if you're running the API server locally you would put in the value `http://localhost:5000`.
* `JWT_SECRET_KEY`: This key is used on the API server to encrypt tokens. This value will need to be the same as what is on the server.
* `SESSION_SECRET_KEY`: Any long, undecipherable string that would be hard to guess! This is used for sessions.
* `APP_LOGIN_EMAIL` and `APP_LOGIN_PASSWORD`: An email and password combination that correspond to an account in the database. This will be the account you are logged in to by default if you're working in development mode.

It's important to note that the `.env` file is _not_ loaded when the `NODE_ENV` is production. If you'd like to change that, you can go to the [main-config.js](../src/server/config/main-config.js) file and find the following line:

```js
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
```


### .eslintrc

[ESLint](http://eslint.org/) is a great tool for making your JavaScript code looks great. Three cheers for [JavaScript Standard Style](https://github.com/feross/standard)! Down with semicolons! More information on how to run it below.


### gulpfile.js

[Gulp](http://gulpjs.com/) is a build tool that, when run, can do all kinds of fun things for you. You set up a number of tasks which can be run alone or with one another. Our `gulpfile.js` is configured to do the following when you run just `gulp`:

* Lint code using the `.eslintrc` file
* Run a server using nodemon
* Compile `.scss` files into `.css` files
* Watch for any changes and refresh the server

If you'd only like to run a server with gulp, you can run:

```shell
gulp nodemon
```

When setting up this repository to deploy, you should _not_ depend upon gulp. Instead, run:

```shell
npm start
```


### package.json

The `package.json` is a file which describes the dependencies for the build tools and for the server. To install dependencies, you'll run:

```shell
npm install
```

Note, for deploying to Heroku you would need to add a `"engine"` key with the version of node you'd like to run. This repository requires 6 or above.
