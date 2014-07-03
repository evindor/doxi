var dox = require('dox'),
    jade = require('jade'),
    through = require('through2'),
    path  =require('path'),
    fs = require('fs'),
    dataFormatter = require('data-formatter'),
    gutil = require('gulp-util');

module.exports = function(file, options) {

    var options = options || {};
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
	    var template = jade.compile(fs.readFileSync(path.resolve(__dirname, '../templates/index.jade')));
            var html = template({
                data: dataFormatter(data),
                stylesheets: options.stylesheets || [],
                heading: options.heading || "Test"
            });
	    file.contents = new Buffer(html);
	    this.push(file);
	    return cb();
	}
    }

    return through.obj(processFiles);
}
