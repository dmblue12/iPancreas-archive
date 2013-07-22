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

			initialize: function(i, app_router) {
				this.html = _.template(startTemplate);

				this.model.start();

				this.router = app_router;

				this.$el.append(this.html);

				this.$('#welcome1').css('position', 'absolute').delay(2500).fadeOut(2500);
				this.$('#welcome2').css('position', 'absolute').css('bottom', '90px').css('right', '80px').delay(2500).fadeOut(2500);

				this.$svg = d3.select(this.el)
					.append('svg')
					.attr('width', 800)
					.attr('height', 460)
					.attr('id', 'mainSVG');

				this.model.start();
			},

			render: function() {
				console.log('Rendered AppView.');

				this.router.navigate('#/menu', { trigger: true });
			}

		});

		return AppView;
});