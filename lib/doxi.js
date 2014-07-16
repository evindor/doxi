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
    * @group Options
    * @grouptext
    * |Name|Type|Description|
    * |----|----|-----------|
    * |template|string|Path to your custom template|
    * |heading|string|Label to display in top left corner|
    * |title|string|Page title|
    * |stylesheets|Array|List of paths to stylesheets you want to be included|
    */
  var options = {
    template: opts.template || path.resolve(__dirname, '../templates/index.jade'),
    heading: opts.heading || "Doxi",
    title: opts.title || "Doxi",
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
      heading: options.heading,
      title: options.title
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
  * @introduction
  * <h1 style="text-align: center; margin-bottom: 10px;">Doxi</h1>
  * <h2 style="text-align: center; margin-top: 0;">Document your API from code</h1>
  * Doxi is intended to help you build a great single page documentation for your API. This page is the result of running Doxi against it's own [source code](https://github.com/evindor/doxi).
  *
  * Doxi was created for the following use case: you have a closed source project with public API. You don't want to maintain a separate markdown/html documentation, as well you do not want ot disclose your code, file structure and module names. Here Doxi comes in handy. 
  *
  * - Document your API with JSDoc right inside your code.
  *
  * - Join your JSDoc comments from all your files into logical groups.
  *
  * - Use markdown.
  *
  * - Be awesome!
  *   <a href="https://github.com/evindor/doxi"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/652c5b9acfaddf3a9c326fa6bde407b87f7be0f4/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6f72616e67655f6666373630302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png"></a>
  * 
  * @group Installation
  * @grouptext
  * ```
  * npm install --save-dev doxi
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
