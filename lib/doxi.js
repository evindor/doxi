var dox = require('dox')
  , jade = require('jade')
  , through = require('through2')
  , path  =require('path')
  , fs = require('fs')
  , dataFormatter = require('./data-formatter')
  , gutil = require('gulp-util');

module.exports = function(destFile, opts) {
  var all = []
    , opts = opts || {};

  /**
    * Doxi is configurable through a set of options:
    *
    * @group Options
    * @property {string} template path to your custom template
    * @property {string} heading label to display in top left corner
    * @property {Array} stylesheets list of paths to stylesheets you want to be included
    *
    */
  var options = {
    template: opts.template || path.resolve(__dirname, '../templates/index.jade'),
    heading: opts.heading || "Doxi",
    stylesheets: opts.stylesheets || [path.resolve(__dirname, '../node_modules/normalize.css/normalize.css'),
      path.resolve(__dirname, '../stylesheets/solarized.css'),
      path.resolve(__dirname, '../stylesheets/documentation.css')]
  },
  firstFile = null;

  function processFiles(file, encoding, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit("error", new gutil.PluginError("Streams are not supported"));
      return cb();
    }

    if (file.isBuffer()) {
      var data = dox.parseComments(file.contents.toString());
      if (!firstFile) firstFile = file;
      all.push(data);
      cb();
    }
  }

  function render(cb) {
    var stream = this;
    var template = jade.compile(fs.readFileSync(options.template));
    var html = template({
      data: dataFormatter(all),
      stylesheets: options.stylesheets.map(function(stylesheet) {
        return path.basename(stylesheet);
      }),
      heading: options.heading
    });

    this.push(new gutil.File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: path.join(firstFile.base, destFile),
      contents: new Buffer(html)
    }));

    options.stylesheets.map(function(stylesheet) {
      var file = fs.readFileSync(stylesheet);
      stream.push(new gutil.File({
        cwd: firstFile.cwd,
        base: firstFile.base,
        path: path.join(firstFile.base, path.basename(stylesheet)),
        contents: file
      }));
    });
    cb();
  }

  return through.obj(processFiles, render);
}
/**
  * &nbsp;
  *
  * @introduction
  * <h1 style="text-align: center; margin-bottom: 10px;">Doxi</h1>
  * <h2 style="text-align: center; margin-top: 0;">Document your API from code</h1>
  * Doxi is intended to help you build a great single page documentation for your API.
  *
  * Document your API with JSDoc right inside your code.
  *
  * Join your JSDoc comments from all your files into logical groups.
  *
  * Use markdown.
  *
  * Be awesome!
  * 
  * @group Installation
  * @grouptext
  * ```
  * npm install --save doxi
  * ```
  */
/**
 * For now Doxi can be used only with gulp.
 *
 * @example
 *     gulp.task('default', function() {
 *         gulp.src('./lib/doxi.js')
 *             .pipe(doxi('index.html', {template: './templates/index.jade'}))
 *             .pipe(gulp.dest('./'));
 *     });
 *
 * @group Usage instructions
 */
