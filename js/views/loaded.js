define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	var LoadedView = Backbone.View.extend({

		tagName: 'h1',

		className: 'to-clear',

		initialize: function() {
			$('#main').prepend(this.$el.html('Data loaded!'));

			this.$el.delay(2500).fadeOut(2500);
		}
	});

	return LoadedView;
});