define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'text!templates/start.html'
	],
	function($, _, Backbone, d3, startTemplate) {
		var AppView = Backbone.View.extend({

			el: '#main',

			initialize: function() {
				this.html = _.template(startTemplate);
			},

			render: function() {
				console.log('Rendered AppView.');

				this.$el.append(this.html);

				this.$('#welcome').css('position', 'absolute').delay(2500).fadeOut(2500);

				this.$svg = d3.select(this.el)
					.append('svg')
					.attr('width', 800)
					.attr('height', 400)
					.attr('id', 'mainSVG');
			}

		});

		return AppView;
});