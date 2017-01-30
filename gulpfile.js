// *** dependencies *** //

const path = require('path')
const gulp = require('gulp')
const eslint = require('gulp-eslint')
const runSequence = require('run-sequence')
const nodemon = require('gulp-nodemon')
const plumber = require('gulp-plumber')
const sass = require('gulp-sass')
const child_process = require('child_process')

// *** config *** //

const paths = {
  scripts: [
    path.join('src', '**', '*.js'),
    path.join('src', '*.js')
  ],
  css: [
    path.join('src', 'client', 'css', '*.css')
  ],
  scss: [
    path.join('src', 'client', 'scss', '*.scss'),
    path.join('src', 'client', 'scss', '**', '*.scss'),
  ],
  views: [
    path.join('src', 'server', '**', '*.html'),
    path.join('src', 'server', '*.html')
  ],
  server: path.join('src', 'server', 'server.js')
}

const nodemonConfig = {
  script: paths.server,
  ext: 'html js css scss',
  ignore: ['node_modules'],
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
}

function precompileTemplates () {
  console.log("Precompiling nunjucks templates to src/client/js/templates.js")
  child_process.execSync('bin/nunjucks-precompile src/server/views > src/client/js/templates.js')
}

// *** default task *** //

gulp.task('default', () => {
  runSequence(
    ['lint'],
    ['nodemon'],
    ['scss'],
    ['watch']
  )
})

// *** sub tasks ** //

gulp.task('scss', () => {
  return gulp.src(paths.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(path.join('src', 'client', 'css')))
})

gulp.task('lint', () => {
  return gulp.src(paths.scripts)
    .pipe(eslint())
    .pipe(eslint.format('stylish'))
    .pipe(eslint.failAfterError())
})

gulp.task('styles', () => {
  return gulp.src(paths.css)
    .pipe(plumber())
})

gulp.task('views', () => {
  precompileTemplates()
  return gulp.src(paths.views)
    .pipe(plumber())
})

gulp.task('nodemon', () => {
  return nodemon(nodemonConfig)
})

gulp.task('watch', () => {
  gulp.watch(paths.views, ['views'])
      .on('ready', precompileTemplates)
  gulp.watch(paths.scss, ['scss'])
  gulp.watch(paths.scripts, ['lint'])
  gulp.watch(paths.css, ['styles'])
})
