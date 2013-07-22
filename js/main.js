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
		templates: '../assets/templates/',
		json: '../assets/json/'
	}
});

require(['app'], function(App) {
	App.initialize();
});