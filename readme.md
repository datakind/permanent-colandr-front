## Colandr Front End

Front End server for Colandr API.

### Setup

You will need [nodejs](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) to get started. I'd also recommend installing the [n](https://github.com/tj/n) package so that you can manage node versions. To run this repo, you'l need Node 6.x.x.

1. Fork and then clone this repository.
1. Run `npm install` in the newly created folder.
1. Run `npm install --global gulp` anywhere.
1. Update the `.env.sample` file with the appropriate values and then rename as `.env`.
1. Run `gulp`.


> **Note:** Gulp will run a linter, process `.scss` files, and start a server. You must at least run `gulp` once in order for the application to work. If you only want to run the server afterwards, you may run:
```shell
gulp nodemon
```

You will be able to access the front end application on port 3000 by default.

### Auth

Currently, the app uses the environment variables in `.env` to keep you logged in if you're running on `development`. If you'd like to log in as normal, find the `nodemonConfig` inside of `./gulpfile.js`:

```js
const nodemonConfig = {
  script: paths.server,
  ext: 'html js css scss',
  ignore: ['node_modules'],
  env: {
    NODE_ENV: 'development'
  }
}
```

Change that `NODE_ENV` value to anything else but `development`.
