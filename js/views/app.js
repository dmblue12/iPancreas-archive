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

				this.$svg = d3.select('#main')
					.append('svg')
					.attr('width', 1300)
					.attr('height', 640)
					.attr('id', 'mainSVG');

				this.model.start();

				this.listenTo(this.model, 'change:action_taken', this.activate_back);

				this.listenTo(this.model, 'change:navigated', this.save_fragment);

				this.listenTo(this.model, 'change:clear', this.clear);
			},

			render: function() {
				console.log('Rendered AppView.');

				this.$main.prepend(this.html);

				this.$('#welcome1').delay(2500).fadeOut(2500);
				this.$('#welcome2').css('bottom', '10px').css('right', '10px').delay(2500).fadeOut(2500);

				app_router.navigate('#/menu/init');
			},

			activate_back: function() {
				this.$('#back-button').removeClass('disabled');
			},

			save_fragment: function() {
				if (this.model.get('navigated')) {
					this.model.set('forward', Backbone.history.getFragment());	
				}
				this.model.set('navigated', false);
			},

			clear: function() {
				console.log('Fired clear.');
				if (this.model.get('clear')) {
					this.$main.empty();	
				}
				this.model.set('clear', false);
			}

		});

	return AppView;
});