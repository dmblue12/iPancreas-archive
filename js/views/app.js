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

			events: {
				'click #previous-unit': 'retreatUnit',
				'click #next-unit': 'advanceUnit'
			},

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

				this.listenTo(this.model, 'change:batchIndex', this.updateButton);
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
			},

			advanceUnit: function() {
				console.log('Triggered advanceUnit!');

				if (!$('#next-unit').hasClass('disabled')) {
					this.model.set('batchIndex', this.model.get('batchIndex') + 1);

					var batch = dexcomBatches.get(Backbone.history.fragment.replace('summary/', ''));

					var data = batch.get('data');

					batch.set('previous', data[this.model.get('batchIndex') - 1]);

					if (this.model.get('batchIndex') + 1 < data.length) {
						batch.set('next', data[this.model.get('batchIndex') + 1]);
					}

					batch.set('current', data[this.model.get('batchIndex')]);
				}
			},

			retreatUnit: function() {
				console.log('Triggered retreatUnit!');

				if (!$('#previous-unit').hasClass('disabled')) {				
					this.model.set('batchIndex', this.model.get('batchIndex') - 1);

					var batch = dexcomBatches.get(Backbone.history.fragment.replace('summary/', ''));

					var data = batch.get('data');

					batch.set('next', data[this.model.get('batchIndex') + 1]);

					if (this.model.get('batchIndex') - 1 > 0) {
						batch.set('previous', data[this.model.get('batchIndex') - 1]);
					}

					batch.set('current', data[this.model.get('batchIndex')]);
				}
			},

			updateButton: function() {
				var i = this.model.get('batchIndex');

				var batch = dexcomBatches.get(Backbone.history.fragment.replace('summary/', ''));

				var len = batch.get('data').length - 1;

				if ((i > 0) && (i < len)) {
					$('#unit-buttons button').removeClass('disabled');
				}
				else if (i === 0) {
					$('#previous-unit').addClass('disabled');
				}
				else if (i == len) {
					$('#next-unit').addClass('disabled');
				}
			}

		});

	return AppView;
});