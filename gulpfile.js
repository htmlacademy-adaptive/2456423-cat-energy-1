import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import autoprefixer from 'autoprefixer';
import rename from 'gulp-rename';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import del from 'del';
import browser from 'browser-sync';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//HTML
export const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'))
}

//Scripts
export const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
}

//Images

export const optimizeImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
}

export const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/img'))
}

//WebP
export const createWebP = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/img'))
}

//Svg
export const svg = () => {
  return gulp.src('source/img/**/*.svg')
    .pipe(svgo())
    .pipe(gulp.dest('build/img'))
}

export const sprite = () => {
  return gulp.src('source/img/main-logo/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite-inline.svg'))
    .pipe(gulp.dest('build/img'))
}

//Copy

export const copy = (done) => {
  return gulp.src(['source/*.html',
    'source/*.webmanifest',
    'source/**/*.{woff2,woff}',
    'source/*.ico',
    'source/js/*.js',
    'source/img/sprite.svg'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

//Clean

export const clean = () => {
  return del('build');
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    browser:'chrome',
    notify: false,
    ui: false,
  });
  done();
}

//Reload
const reload = (done) => {
  browser.reload();
  done();
}

// Watcher
const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

//Build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    createWebP,
    svg
  ),
);

//Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    createWebP,
    svg
  ),
  gulp.series(
    server,
    watcher
  ));
