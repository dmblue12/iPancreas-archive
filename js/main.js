require.config({
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		d3: {
			exports: 'd3'
		}
	},
	paths: {
		jquery: 'lib/jquery.min',
		underscore: 'lib/underscore-min',
		backbone: 'lib/backbone-min',
		d3: 'lib/d3.v3.min',
		text: 'lib/text',
		templates: '../assets/templates',
		json: '../assets/json',
		python: '../python'
	}
});

require(['app'], function(App) {
	App.initialize();
});

var app_router;

var appModel;

var dexcomBatches;

var parseDate = function(str) {
	year = str.substring(0,4);
	month = str.substring(5,7) - 1;
	day = str.substring(8,10);
	hour = str.substring(11,13);
	minute = str.substring(14, 16);
	second = str.substring(17,19);
	return new Date(year, month, day, hour, minute, second);
};

// TideSDK variables
var w = Ti.UI.currentWindow;

var dataDir = Ti.Filesystem.getApplicationDataDirectory();