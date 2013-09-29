define(['jquery', 'underscore', 'backbone', 'd3', 'models/focused-svg'],
	function($, _, Backbone, d3, FocusedSVG) {
		var SummaryView = Backbone.View.extend({

			el: '#mainSVG',

			initialize: function() {
				console.log('Initialized SummaryView.');

				this.$svg = d3.select(this.el);

				var unit = this.id;

				switch (unit) {
					case 'weeks':
						this.headline = ' by Week';
						break;
					case 'months':
						this.headline = ' by Month';
						break;
					case 'years':
						this.headline = ' by Year';
						break;
				}

				this.$el.empty();
				this.$el.show();
			},

			render: function() {
				console.log('Rendered SummaryView.');
				$('#main').prepend('<h2 class="to-clear">Dexcom Data: Summaries' + this.headline + '</h2>');
			},

			loadFirstUnit: function() {

				var f = _.clone(this.model.attributes);

				console.log(this.model.toJSON());

				f.h = f.height - f.margin_top - f.margin_bottom;

				f.w = f.width - f.margin_left - f.margin_right;

				f.pad = f.margin_left - f.margin_right;

				this.$svg.append("svg:svg")
					.attr("width", f.width)
					.attr("height", f.height)
					.attr("x", f.x)
					.attr("y", f.y)
					.append("svg:g")
					.attr("id", "focus")
					.attr("transform", "translate(" + this.model.get('margin_left') + "," + this.model.get('margin_top') + ")");

				this.$focus = d3.select('#focus');

				var current = this.model.get('data');

				var yScale = d3.scale.linear()
					// domain is 20 to 420 so that Lo and Hi values changed to 39 and 401 will be included, potentially
					.domain([20, 420])
					// range goes from h to 0 because of the lovely backwards way in which the SVG coord system works
					.range([f.h, 0]);

				var dataset = d3.layout.histogram()
					.value(function(d) { return d; })
					// group the data into 20 bins
					.bins(yScale.ticks(20))
					(current['Blood Glucose Values']);

				var xScale = d3.scale.linear()
					// domain is 0 to the max frequency of BG readings in a bin
					// (which is d.y since the histogram layout is designed to do vertical, not horizontal histograms)
					.domain([0, d3.max(dataset, function(d) { return d.y; })])
					.range([0, f.w]);

				var redScale = d3.scale.linear()
					.domain([0, d3.max(dataset, function(d) { return d.y; })])
					.range(['#000000', '#BD362F'])
					.interpolate(d3.interpolateHcl);

				var blueScale = d3.scale.linear()
					.domain([0, d3.max(dataset, function(d) { return d.y; })])
					.range(['#000000', '#0044CC'])
					.interpolate(d3.interpolateHcl);

				startDate = new Date(current['Start Date']);
				var startYear = startDate.getFullYear();
				var startMonth = startDate.getMonth();
				var startCal = startDate.getDate();
				var startDay = startDate.getDay();
				var diff = startDay - 1;
				if (startDay !== 1) {
					startDate = new Date(startYear, startMonth, startCal - diff);
				}
				$('#week-of').html("Week of " + startDate.toDateString());

				this.yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left");

				this.$focus.selectAll("rect")
					.data(dataset)
					.enter()
					.append("svg:rect")
					// attributes that don't need updated
					.attr({
						// these provide the rounded corners of the histogram bars
						rx: 5,
						ry: 5,
						"class": "bar",
						"data-toggle": "popover"
					})
					// attributes that do need updated
					.attr({
						x: function(d) {
							// x-coord of given bar is the midpoint of the active area of the graphic (w - xScale(d.y)) / 2
							// plus half of the portion of the left margin not devoted to the y-axis (margin.left - pad) / 2 = 5px
							return (f.w - xScale(d.y)) / 2 + (f.margin_left - f.pad) / 2;
						},
						y: function(d) {
							// y-coord of given bar is the position assigned by yScale (i.e., the bin) minus the height of each bin
							// height of bin obtained here by getting the y position of the last element in the dataset (which will be the bottom bin)
							return yScale(d.x) - yScale(dataset[dataset.length - 1].x);
						},
						width: function(d) {
							return xScale(d.y);
						},
						height: function(d, i) {
							// creating my own sort of rangeBands here, with 10% padding
							// yScale(dataset[dataset.length -1].x) is the height of each bin, so setting each bar to 90% of that to allow for space between
							return yScale(dataset[dataset.length - 1].x) * 0.9;
						},
						fill: function(d) {
							// scale(value) / w gives a number between 0.0 and 1.0 to determine "percentage" of non-black color in each bar
							if (d.x < 80) {
								return redScale(d.y);
							}
							else if ((d.x >= 80) && (d.x < 140)) {
								return blueScale(d.y);
							}
							else if (d.x >= 140) {
								return redScale(d.y);
							}
						}
					})
					// data attributes for popovers
					.attr("title", function(d) {
						return "Between " + d.x + " and " + parseInt(d.x + 20) + " mg/dL";
					})
					.attr("data-content", function(d) {
						if (d.y === 1) {
							return d.y + " reading";
						}
						return d.y + " readings";
					});
			}

		});

	return SummaryView;
});