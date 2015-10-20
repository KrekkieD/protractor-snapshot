# Protractor-snapshot

Protractor HTML snapshot and screenshot utility.

## Description

Create HTML snapshots and screenshots from anywhere in your end-to-end tests.

Includes a cycle function that can create snapshots and screenshots for every resolution you support. Very convenient for validating your responsive design.

In conjunction with [buenos-uncss](https://npmjs.com/package/buenos-uncss) you can find unused CSS selectors by evaluating the HTML snapshots.

## Installing

```bash
$ npm install --save-dev protractor-snapshot
```

## Usage

```javascript
# some.spec.js

var $snapshot = require('protractor-snapshot');

describe('The snapshot suite', function () {

	it('Should create snapshots from my spec', function () {
		
		// create screenshot
		$snapshot.image();
		
		// create html snapshot
		$snapshot.source();
		
	});
	
	it('Should create a snapshot for each resolution I support', function () {
	
		// iterate over configured resolutions
		$snapshot.cycle(function (resolution) {
		
			// call these functions for each resolution
			$snapshot.image();
			$snapshot.source();
		
		});
	
	});

});

```

## Configuration

```javascript
# protractor.conf.js

module.exports.config = {
	protractorSnapshotOpts: {
	
		// base format for created files
		// replaces %suiteName%, %suiteId%, %specName%, %specId%, %browser%, %resolution% and %increment% with their respective values
		basename: '%resolution%/%suiteId% - %suiteName%/%browser% - %specId% - %specName% (%increment%)',
		
        image: {
        
        	// where to put the screenshots, used by the default callback
            target: './reports/protractor-snapshot/custom/image',
            
            // default callbacks to handle the screenshot data
            callbacks: [
                function (instance, png, customConfig) {
                    // instance = $snapshot instance
                    // png = image data
                    // customConfig = argument provided to .image()
                },
                
                // by default this callback is configured 
                require('protractor-snapshot').saveImage
            ]
        },
        
        source: {
        
        	// where to put the html snapshots, used by the default callback
            target: './reports/protractor-snapshot/custom/source',
            
            // default callbacks to handle snapshot data
            callbacks: [
                function (instance, html, customConfig) {
                    // instance = $snapshot instance
                    // html = html contents of page as string
                    // customConfig = argument provided to .source()
                },
                
                // by default this callback is configured
                require('protractor-snapshot').saveSource
            ]
        },
        
        // what resolution to turn back to after cycle(), [width, height, type]
        // type can be 'window' for outer window size, or 'viewport' for viewport size
        defaultResolution: [700, 700, 'window'],
        
        // supported resolutions, array of [width, height, type]
        // type can be 'window' for outer window size, or 'viewport' for viewport size
        resolutions: [
            [1366, 768, 'window'],
			[320, 568, 'viewport']
        ]
    }
}
```

## API
### ProtractorSnapshot (class)

Instance is created and configured on `require()`.

```javascript
var $snapshot = require('protractor-snapshot'); // ProtractorSnapshot
```

#### `ProtractorSnapshot.setConfig([options])`

Reconfigure the current instance with new options. `options` are always extended with the default options.

#### `ProtractorSnapshot.cycle([resolutions], callback)`

Provide `resolutions` to override configured resolutions. 

The callback is called when the window is resized to the targeted resolution. 

#### `ProtractorSnapshot.image([name || callback])`

Creates a screenshot. 

When using the default image callback:

- Specify a string to use as custom filename.
- Specify a function to use as a custom callback (called after other callbacks).
- Or leave empty.

When using a custom callback:

- The provided parameter is sent to your callback as third argument.
- Or leave empty.

Returns a promise that is resolved with an array of callback return values.

#### `ProtractorSnapshot.source([name || callback])`

Creates an HTML snapshot.

When using the default source callback:

- Specify a string to use as custom filename.
- Specify a function to use as a custom callback (called after other callbacks).
- Or leave empty.

When using a custom callback:

- The provided parameter is sent to your callback as third argument.
- Or leave empty.

Returns a promise that is resolved with an array of callback return values.

#### `ProtractorSnapshot.getSuiteName()`

Returns current `Jasmine` suite name.

#### `ProtractorSnapshot.getSpecName()`

Returns current `Jasmine` spec name.

#### `ProtractorSnapshot.config`

Returns current configuration object.

### `$snapshot.saveImage`

Default callback for image saving. Uses `image.target` property from config to store image files.

### `$snapshot.saveSource`

Default callback for source saving. Uses `source.target` property from config to store html files. 

## Roadmap

- implement screenshot comparison utility
- rotate the supported resolutions
- identify resolutions by specifying device name (i.e. iphone5)
