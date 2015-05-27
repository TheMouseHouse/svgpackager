'use strict';

var Fs      = require('fs'),
    Path    = require('path'),
    Colors  = require('colors'),
    options = require('./options.js').get();

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
			_file = Path.resolve(_file);

            if(Fs.existsSync(_file)) {
                Fs.unlinkSync(_file);
            }

			Fs.writeFileSync(_file, _data);

            if(!_this.opts.silent) {
                console.log(_file + ' saved!');
            }
		}
	};

	_this.getMime = function() {
		return 'data:image/svg+xml;' + (_this.opts.base64 ? 'base64,' : 'utf8,');
	};

	_this.createGlobalCssProperty = function(_pkg, _files){
		var file,
		    selectors = [];

		if(_this.opts.prefix.length){
			selectors.push('.' + _pkg + ' [class^="' + _this.opts.prefix + '"]');
			selectors.push('.' + _pkg + ' [class*=" ' + _this.opts.prefix + '"]');
		} else {
			for(file in _files) {
				selectors.push('.' + _pkg + ' .' + _this.getFileName(_files[file]));
			}
		}

		return selectors.join() + '{display: inline-block;background-repeat: no-repeat;background-size:100%;background-position: center center;vertical-align: middle;}';
	};

	_this.createCssProperties = function(_pkg, _file, _data) {
		var selector   = '.' + _pkg + ' .' + _this.opts.prefix + _file,
		    width      = 'width:' + _data.info.width + ';',
		    height     = 'height:' + _data.info.height + ';',
		    background = "background-image: url('" + _data.data + "');";

		return selector + '{' + background + width + height + '}';
	};

	_this.findLongestStringInArray = function(arr){
		return arr.sort(function (a, b) { return b.length - a.length; })[0];
	};

    _this.outputFileInfo = function(str, lengthLimit){
        var padding = ' ...................................'.white;
        var output  = str.yellow + padding.substring(0, lengthLimit + 10 - str.length);
        console.log(output + ' OK!'.green);
    };
}
var processor = new Processor();

function svgpackager(opts, callback) {
	for(var opt in opts) {
		options[opt] = opts[opt];
	}

	if(options.debug) {
        var debug_output = {};
        debug_output.options = options;
	}

	processor.opts = options;

	var src   = Path.resolve(options.source),
	    dest  = Path.resolve(options.dest),
	    pkg   = options.package,
	    files = processor.getFiles(src),
	    data  = {},
	    longestFileName = processor.findLongestStringInArray(files);

	if(files.length > 0) {
		var i,
		    SVGO = require('svgo'),
		    svgo = new SVGO(/*{ custom config object }*/);

		if(!Fs.existsSync(dest)) {
			Fs.mkdirSync(dest);
		}

		if(options.base64) {
			var base64js = require('base64-js');
		}

		for(i in files) {
			var file       = files[i],
			    fileName   = processor.getFileName(file),
			    cssName    = processor.getCssName(fileName),
			    svgContent = processor.readFile(src, file);

			svgo.optimize(svgContent, function(optimized) {
				if(options.base64) {
					var byteArray = new Buffer(optimized.data, 'utf8');
					optimized.data = base64js.fromByteArray(byteArray);
				}
				optimized.info.width  += 'px';
				optimized.info.height += 'px';

				if(options.prefixsvg) {
					optimized.data = processor.getMime() + optimized.data;
				}

				if(!options.silent) {
					processor.outputFileInfo(file, longestFileName.length);
				}

				data[cssName] = optimized;
			});
		}

		if(options.output === 'all' || options.output === 'json') {
			var json     = JSON.stringify(data),
			    jsonFile = dest + '/' + pkg + '.json';

			if(!options.debug) {
				processor.writeFile(jsonFile, json);
			} else {
                debug_output.json = json;
			}
		}

		if(options.output === 'all' || options.output === 'css') {
			var css     = processor.createGlobalCssProperty(pkg, files),
			    cssFile = dest + '/' + pkg + '.css';

			for(i in data) {
				css += processor.createCssProperties(pkg, i, data[i]);
			}

			if(!options.debug) {
				processor.writeFile(cssFile, css);
			} else {
                debug_output.css = css;
			}
		}

        var expression = callback && callback();

        if(options.debug && !options.silent){
            console.log(JSON.stringify(debug_output).white);
            return debug_output;
        }
	}
}

exports.pack = svgpackager;
