const { dest, parallel, series, src, watch, task } = require("gulp")
const fs = require('fs');
const del = require("del");
const concat = require("gulp-concat");
const newer = require("gulp-newer");
const imagemin = require("gulp-imagemin");
const pug = require("gulp-pug");
const cleanCSS = require("gulp-clean-css");
const less = require('gulp-less');
const minify = require("gulp-minify");

const pugData = require("./data");
const outputDir = "./public/";
const debugOutputDir = "./debug/";

// clean outputDir
function clean() {
  return del([outputDir, debugOutputDir]);
}

function debugData(cb) {
  fs.mkdirSync(debugOutputDir);
  fs.writeFileSync(debugOutputDir+'pugData.json', JSON.stringify(pugData, null, 2));
  cb();
}

// Optimize Images
function images() {
  return src("assets/images/**/*", { base: "assets" })
    .pipe(newer(outputDir))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true,
            },
          ],
        }),
      ])
    )
    .pipe(dest(outputDir));
}

// HTML task
function html(done) {
  const tasks =  [
    "index.pug",
    "materials.pug",
    "products.pug"
  ].map(page => {
    function htmlSubTask() {
      return src(["assets/pug/mixins/*.pug", "assets/pug/" + page])
        .pipe(concat(page, { newLine: "\n\n" }))
        .pipe(dest(debugOutputDir))
        .pipe(
          pug({
            pretty: true,
            locals: pugData,
          })
        )
        .pipe(dest(outputDir));
    }

    htmlSubTask.displayName = `html/${page}`;
    return htmlSubTask
  });

  return series(...tasks, seriesDone => {
    fs.mkdir(debugOutputDir, () => {
      fs.writeFile(debugOutputDir+'pugData.json', JSON.stringify(pugData, null, 2), () => {
        seriesDone();
        done();
      });
    });
  })();
}

// CSS task
function css() {
  return src("assets/less/*.less")
    .pipe(less())
    .pipe(dest(outputDir));
}

function js() {
  return src("assets/js/*.js")
    .pipe(concat("scripts.js"))
    .pipe(
      minify({
        ext: { min: ".js" },
        noSource: true,
      })
    )
    .pipe(dest(outputDir));
}

function watchTask() {
  watch("assets/pug/**/*", html);
  watch("assets/less/**/*", css);
  watch("assets/js/**/*", js);
  watch("assets/images/**/*", images);
}

const build = series(clean, parallel(images, html, css, js));

exports.clean = clean;
exports.images = images;
exports.html = html;
exports.css = css;
exports.js = js;

exports.debugData = debugData;
exports.build = build;
exports.watch = watchTask;

exports.default = build;


exports.test = (cb) => {
  console.log('test');
  cb();
}