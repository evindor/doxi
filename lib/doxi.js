var dox = require('dox'),
    jade = require('jade'),
    through = require('through2'),
    path  =require('path'),
    fs = require('fs'),
    dataFormatter = require('./data-formatter'),
    gutil = require('gulp-util');

module.exports = function(destFile, opts) {
    var all = [],
        options = {
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
            stylesheets: options.stylesheets,
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
                contents: new Buffer(html)
            }));
        });
        cb();
    }

    return through.obj(processFiles, render);
}
