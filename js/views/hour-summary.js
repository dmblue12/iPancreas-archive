define(['jquery', 'underscore', 'backbone', 'd3', 'text!templates/locate.html'],
	function($, _, Backbone, d3, locateHTML) {
		var HourView = Backbone.View.extend({

			el: '#mainSVG',

			initialize: function() {

				this.$svg = d3.select(this.el);

				this.batch = dexcomBatches.get(this.id);

				this.listenTo(dexcomBatches, 'change:current', this.updateUnit);

				this.listenTo(this.model, 'change:data', this.updateD);
			},

			updateF: function() {
				console.log('Triggered updateF (hour view).');

				f = _.clone(this.model.attributes);

				f.h = f.height - f.margin_top - f.margin_bottom;

				f.w = f.width - f.margin_left - f.margin_right;

				f.pad = f.margin_left - f.margin_right;
			},

			loadFirstUnit: function() {
				this.updateF();

				// TODO: comment this out in production!
				// this is just to be able to see the borders of my SVG
				this.$svg.append("svg:rect")
					.attr("width", f.width)
					.attr("height", f.height)
					.attr("x", f.x)
					.attr("y", f.y)
					.attr("class", "show");

				this.$svg.append("svg:svg")
					.attr("width", f.width)
					.attr("height", f.height)
					.attr("x", f.x)
					.attr("y", f.y)
					.append("svg:g")
					.attr("id", f.id)
					.attr("transform", "translate(" + f.margin_left + "," + f.margin_top + ")");

				this.$sm = d3.select("#" + f.id);

				var current = this.model.get('data');

				var previous = this.model.get('previous-data');

				var next = this.model.get('next-data');
			}
		});

	return HourView;
});