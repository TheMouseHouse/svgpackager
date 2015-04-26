'use strict';

var Fs   = require('fs'),
    Path = require('path');

function Processor() {
	var _this = this;

    _this.opts = {};

	_this.getFiles = function(_src) {
		return Fs.readdirSync(_src).filter(function(_str) {
			return /\.svg/.test(_str);
		});
	};

	_this.getFileName = function(_name) {
		return Path.basename(_name, '.svg');
	};

	_this.getCssName = function(_name) {
		return _name.split('.').join('-');
	};

	_this.readFile = function(_src, _file) {
		return Fs.readFileSync(Path.resolve(_src + "/" + _file), 'utf8');
	};

	_this.writeFile = function(_file, _data) {
		if(typeof _file !== 'undefined') {
			Fs.writeFile(_file, _data, function(err) {
				if(err) {
					throw err;
				}
				console.log(_file + ' saved!');
			});
		}
	};

    _this.getMime = function(){
        return 'data:image/svg+xml;' + (_this.opts.base64 ? 'base64,' : 'utf8,');
    };

	_this.createCssProperties = function(_pkg, _file, _data){
		var background,
		    selector    = '.' + _pkg + ' .' + _file,
		    width       = 'width:' + _data.info.width + ';',
			height      = 'height:' + _data.info.height + ';',
		    minWidth    = 'min-' + width,
		    minHeight   = 'min-' + height,
			overflow    = 'overflow:hidden;';

		background = "background-image: url('" + _data.data + "');";

		return selector + '{' + background + '}' + selector + '.original{' + width + minWidth + height + minHeight + overflow + '}';
	}
}
var processor = new Processor();

function svgpackager(opts) {
	if(typeof opts === 'undefined' || opts === null){
		throw 'No options defined.';
	}

	if(opts.debug) {
        console.log('options: ', opts);
    }

    processor.opts = opts;

	var src   = Path.resolve(opts.source),
	    dest  = Path.resolve(opts.dest),
	    pkg   = opts.package,
	    files = processor.getFiles(src),
	    data = {};

	if(files.length > 0) {
		var i,
            SVGO = require('svgo'),
            svgo = new SVGO(/*{ custom config object }*/);

		if(!Fs.existsSync(dest)) {
			Fs.mkdirSync(dest);
		}

		if(opts.base64) {
			var base64js = require('base64-js');
		}

		for(i in files) {
			var file = files[i],
                fileName   = processor.getFileName(file),
                cssName    = processor.getCssName(fileName),
                svgContent = processor.readFile(src, file);

			svgo.optimize(svgContent, function(optimized) {
				if(opts.base64) {
					var byteArray = new Buffer(optimized.data, 'utf8');
					optimized.data = base64js.fromByteArray(byteArray);
				}
				optimized.info.width += 'px';
				optimized.info.height += 'px';

                if(opts.prefixsvg){
                    optimized.data = processor.getMime() + optimized.data;
                }

				data[cssName] = optimized;
			});
		}

		if(opts.output === 'all' || opts.output === 'json') {
			var json = JSON.stringify(data),
                jsonFile = dest + '/' + pkg + '.json';

            if(!opts.debug){
    			processor.writeFile(jsonFile, json);
            } else {
                console.log('json: ', json);
            }
		}

		if(opts.output === 'all' || opts.output === 'css') {
			var css = '',
                cssFile = dest + '/' + pkg + '.css';

			for(i in data) {
				css += processor.createCssProperties(pkg, i, data[i]);
			}

            if(!opts.debug){
    			processor.writeFile(cssFile, css);
            } else {
                console.log('css:', css);
            }
		}
	}
}

exports.pack = svgpackager;
