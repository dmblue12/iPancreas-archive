define(['jquery', 'underscore', 'backbone'],
	function($, _, Backbone) {
		var SummaryView = Backbone.View.extend({

			el: '#mainSVG',

			initialize: function() {
				console.log('Initialized SummaryView.');

				this.$svg = d3.select(this.el);
				// TODO: move to router and make agnostic re: units
				d3.json('file://' + dataDir.nativePath() + '/dexcom_' + this.id + '.json', function(error, json) {
					if (error) {
						return console.warn(error);
					}
					weeks = json["Weeks"];
					currentWeek = weeks[0];
					console.log(currentWeek);
				});

				this.$el.empty();
				this.$el.show();
			},

			render: function() {
				console.log('Rendered SummaryView.');
			}

		});

	return SummaryView;
});