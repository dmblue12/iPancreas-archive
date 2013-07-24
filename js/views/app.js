define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'text!templates/start.html'
	],
	function($, _, Backbone, d3, startTemplate) {
		var AppView = Backbone.View.extend({

			el: '#app',

			initialize: function() {
				this.$main = this.$('#main');

				this.html = _.template(startTemplate);

				this.$main.append(this.html);

				this.$('#welcome1').css('position', 'absolute').delay(2500).fadeOut(2500);
				this.$('#welcome2').css('position', 'absolute').css('bottom', '70px').css('right', '10px').delay(2500).fadeOut(2500);

				this.$svg = d3.select('#main')
					.append('svg')
					.attr('width', 1300)
					.attr('height', 640)
					.attr('id', 'mainSVG');

				this.model.start();
			},

			render: function() {
				console.log('Rendered AppView.');

				app_router.navigate('#/menu/init', { trigger: false });
			}

		});

	return AppView;
});