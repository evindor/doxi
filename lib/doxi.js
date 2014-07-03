var dox = require('dox'),
    jade = require('jade'),
    through = require('through2'),
    path  =require('path'),
    fs = require('fs'),
    dataFormatter = require('./data-formatter'),
    gutil = require('gulp-util');

module.exports = function(file, options) {
    var all = [],
        options = options || {},
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
        var template = jade.compile(fs.readFileSync(path.resolve(__dirname, '../templates/index.jade')));
        var html = template({
            data: dataFormatter(all),
            stylesheets: options.stylesheets || [],
            heading: options.heading || "Test"
        });
        this.push(new gutil.File({
            cwd: firstFile.cwd,
            base: firstFile.base,
            path: path.join(firstFile.base, file),
            contents: new Buffer(html)
        }));
        cb();
    }

    return through.obj(processFiles, render);
}
