svgpackager (svgp)
==================

This tool gathers all your SVG from a source folder and packages them all into a JSON file and a CSS file.

All arguments are optional. If no arguments are passed, this packager will use the current working directory as the source and destination, and the name of the directory will become the package name.

The name of the SVG file will become the key in the JSON file and the class name in the CSS file.
If the file name has a dot (.), that dot will be replaced with a dash (-).
Example:
icon.clock.svg will become `.icon-clock {}`

The package name will be used as the parent class of the CSS classes.
Example:
Package name = myPackage.

CSS will become `.myPackage .icon-clock {}`

Install
-------
    npm install -g svgpackager


Options
-------
```
--source      Source directory  [Default: path of current working directory]
--dest        Output directory  [Default: path of current working directory]
--package     Source directory  [Default: current working directory]
--prefixsvg   Prefixes the SVG content with data:image/svg+xml;utf8,  [Default: true]
--prefix      All CSS classes for individual files will be prefixed to .prefix-filename {}  [Default: '']  
--output      Will output the defined file. [Options: all | json | css]  [Default: all]
--base64      Will encode SVG content to Base64
--debug       Dry run. Outputs data to console without saving files.
--silent      No output will be logged to console.
```

Usage - Stand alone
-----
```
svgp [source dir] [destination dir] [package name] [options]
```

Examples:

If your are in the folder where your source SVG files are then just run:
```
svgp
```
##### --source and --dest
If your sources are in the folder `svg` and you want to package them into the `build` folder, just run:
```
svgp --source=svg --dest=build
```

You can use absolute paths:
```
svgp --source=C:\path\to\my\svg\files --dest=C:\path\to\my\build\folder
```

##### --package
Name your package by adding a third parameter:
```
svgp --source=svg --dest=build --package=myPackageName
```

##### --prefixsvg
Default: true  
Will prefix the SVG or Base64 data with `data:image/svg+xml;utf8,` or `data:image/svg+xml;base64,` respectively.

##### --json
If you just want the JSON file, add the `--json` option...
```
svgp --source=svg --dest=build --json
```

##### --css
... and similar with the CSS file, if you just want the CSS, add `--css`
```
svgp --source=svg --dest=build --css
```

##### --base64
If you wish to encode the SVG data to base64, add the `--base64` option:
```
svgp --source=svg --dest=build --base64
```
The default setting is `base64=false` which outputs a normal utf8 string. Base64 outputs a larger file, but I included this option if anyone wants it.

##### --prefix
Default: Blank string.  
Option used to prefix all class names.
If left as blank string, a global style will be created using file names as CSS class names...
```
.package .filename_1,
.package .filename_2,
.package .filename_3
/* ... all file names ... */
{
    display: inline-block;
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center center;
    vertical-align: middle;
}

.package .filename_1 {
    /* ... */
}
.package .filename_2 {
    /* ... */
}
.package .filename_3 {
    /* ... */
}
```
 However, if prefix is defined then a global style will created using the following selectors. Therefore, `--prefix=icon-` will produce the following CSS:
```
.package [class^=".icon-"],
.package [class*=" .icon-"] {
    display: inline-block;
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center center;
    vertical-align: middle;
}

.package .icon-filename_1 {
    /* ... */
}
.package .icon-filename_2 {
    /* ... */
}
.package .icon-filename_3 {
    /* ... */
}
```

Usage - via require()
---------------------
You can pass only the options needed. Below is just an example of all available options.

```
var svgp = require('svgpackager');

svgp.pack({
    source:    'path\to\svg\files',
    dest:      'output\folder\to\save\files',
    package:   'myPackageName',
    prefixsvg: true,
    prefix:    'icon-',
    output:    'all',
    base64:    true,
    debug:     true,
    silent:    true
});
```

Future
------
* I might add recursive traversal of folders so that you can run the packager once in a folder with a number of folders, and automatically create the packages from the folder names found.

* I'll try to add some tests. I hate tests. If anybody feels like writing tests, just let me know :D

* Better Grunt / Gulp integration.

* Custom CSS injection.

* Generate HTML file displaying all generated SVG on one page.


Licence
-------
MIT © The Mouse House - 2015

Changes
-------
*v1.0.1*  
Added ability to pass callback as second argument when using `require('svgpackager').pack(options, callback);`  


*v1.0.0*  
Fixed typos and updated README  
Released as version 1.


*v0.0.8*  
Fixed generated CSS!  
Added file/class prefixing eg. all CSS classes for individual files can be prefixed to .prefix-filename {}  
Outputing more/better info to console during packaging.


*v0.0.7*  
Fixed minor typos.  

*v0.0.6*  
Added support for use in other npm packages via require();  
Fixed options bug when using *svgpackager* via require();

*v0.0.5*  
Added [nomnom](https://www.npmjs.com/package/nomnom) package for arguments/options.  
Refactored arguments.  
Added new `--output` and `--debug` options.

*v0.0.4*  
Fixed bug where current working directory was not being correctly defined.  

*v0.0.3*  
Enable tool from command line.

*v0.0.2*  
Creates destination directory if does not exist.

*v0.0.1*  
Basic functionality.
