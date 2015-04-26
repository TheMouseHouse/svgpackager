'use strict';

var Fs   = require('fs'),
    Path = require('path');

function Processor() {
	var _this = this;

	_this.flags = {
		base64: false,
		json: true,
		css: true
	};

	_this.parseArguments = function(_args) {
		var tmpArgs = [];

		for(var i in _args) {
			switch(_args[i]) {
				case 'node':
				case 'svgpackager':
				case Path.resolve(__dirname, 'index.js'):
					continue;

				case '--base64':
					_this.flags.base64 = true;
					break;
				case '--json':
					_this.flags.css = false;
					break;
				case '--css':
					_this.flags.json = false;
					break;

				default:
					tmpArgs.push(_args[i]);
			}
		}

		return tmpArgs;
	};

	_this.resolveSource = function(_str) {
		if(typeof _str !== 'undefined') {
			return Path.resolve(_str);
		} else {
			return Path.resolve(__dirname);
		}
	};

	_this.resolveDestination = function(_str, _src) {
		if(typeof _str !== 'undefined') {
			return Path.resolve(_str);
		} else {
			return Path.resolve(_src);
		}
	};

	_this.resolvePackageName = function(_str, _src) {
		if(typeof _str !== 'undefined') {
			return _str;
		} else {
			return Path.basename(_src);
		}
	};

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

			Fs.writeFile(_file, _data, function(err) {
				if(err) {
					throw err;
				}
				console.log(_file + ' saved!');
			});
		}
	};

	_this.createCssProperties = function(_pkg, _file, _data){
		var fileContent,
		    background,
		    selector  = '.' + _pkg + ' .' + _file,
		    width     = 'width:' + _data.info.width + 'px;',
			height    = 'height:' + _data.info.height + 'px;',
		    minWidth  = 'min-' + width,
		    minHeight = 'min-' + height,
			overflow  = 'overflow:hidden;';

		if(_this.flags.base64){
			fileContent = 'base64,' + _data.base64;
		} else {
			fileContent = 'utf8,' + _data.data;
		}

		background = "background-image: url('data:image/svg+xml;" + fileContent + "');";

		return selector + '{' + background + '}' + selector + '.original{' + width + minWidth + height + minHeight + overflow + '}';
	}
}
var processor = new Processor();

function svgp() {
	var args  = processor.parseArguments(process.argv),
		src   = processor.resolveSource(args[0]),
		dest  = processor.resolveDestination(args[1], src),
		pkg   = processor.resolvePackageName(args[2], src),
		files = processor.getFiles(src),
		data  = {};

	if(files.length > 0) {
		var i,
		    SVGO = require('svgo'),
		    svgo = new SVGO(/*{ custom config object }*/);

		if(processor.flags.base64) {
			var base64js = require('base64-js');
		}

		for(i in files) {
			var file       = files[i],
			    fileName   = processor.getFileName(file),
			    cssName    = processor.getCssName(fileName),
			    svgContent = processor.readFile(src, file);

			svgo.optimize(svgContent, function(optimized) {
				if(processor.flags.base64) {
					var byteArray = new Buffer(optimized.data, 'utf8');
					optimized.base64 = base64js.fromByteArray(byteArray);
				}
				data[cssName] = optimized;
			});
		}

		if(processor.flags.json) {
			var json = JSON.stringify(data),
			    jsonFile = dest + '/' + pkg + '.json';

			processor.writeFile(jsonFile, json);
		}

		if(processor.flags.css) {
			var css = '',
			    cssFile = dest + '/' + pkg + '.css';

			for(i in data) {
				css = css + processor.createCssProperties(pkg, i, data[i]);
			}

			processor.writeFile(cssFile, css);
		}
	}
}

svgp();
