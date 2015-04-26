# svgpackager

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

### Install
```
    npm install -g svgpackager
```

### Usage
```
    svgpackager [source dir] [destination dir] [package name] [options]
```

Examples:

If your are in the folder where your source SVG files are then just run:
```
    svgpackager
```

If your sources are in the folder `svg` and you want to package them into the `build` folder, just run:
```
    svgpackager svg build
```

You can use absolute paths:
```
    svgpackager C:\path\to\my\svg\files C:\path\to\my\build\folder
```

Name you package by adding a third parameter:
```
    svgpackager svg build myPackageName
```

If you just want the JSON file, add the `--json` option...
```
    svgpackager svg build --json
```

... and similar with the CSS file, if you just want the CSS, add `--css`
```
    svgpackager svg build --css
```

If you wish to encode the SVG data to base64, add the `--base64` option:
```
    svgpackager svg build --base64
```
The default setting is `base64=false` which outputs a normal utf8 string. Base64 outputs a larger file, but I included this option if anyone wants it.


### Future
* I might add recursive traversal of folders so that you can run the packager once in a folder with a number of folders, and automatically create the packages from the folder names found.

* I'll try to add some tests. I hate tests. If anybody feels like writing tests, just send me a pull request :D

* Grunt / Gulp integration.


### Licence
MIT

### Changes
* v0.0.2 - Creates destination directory if does not exist.
* v0.0.1 - Basic functionality.
