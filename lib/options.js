'use strict';

function options(){
    var Path = require('path'),
        cwd  = process.cwd(),
	    pkg  = Path.basename(cwd);

    var opts = require('nomnom')
    .option('source', {
        default: cwd,
        help: 'Source directory'
    })
    .option('dest', {
        default: cwd,
        help: 'Output directory'
    })
    .option('package', {
        default: pkg,
        help: 'Source directory'
    })
    .option('prefixsvg', {
        flag: true,
        default: true,
        help: 'Prefixes the SVG content with data:image/svg+xml;utf8,'
    })
    .option('prefix', {
	    default: '',
	    help: 'Prefixes all files with given string.'
    })
    .option('output', {
        default: 'all',
        help: 'Will output the defined file. [Options: all | json | css]'
    })
    .option('base64', {
        flag: true,
        help: 'Will encode output to Base64'
    })
    .option('debug', {
	    flag: true,
	    help: 'Dry run. Outputs data to console without saving files.'
    })
    .option('silent', {
	    flag: true,
	    help: 'No output will be logged to console.'
    })
    .parse();

    return opts;
}

exports.get = options;
