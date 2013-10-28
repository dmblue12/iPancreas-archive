define(['jquery', 'underscore', 'backbone', 'd3', 'text!templates/locate.html'],
	function($, _, Backbone, d3, locateHTML) {
		var DayView = Backbone.View.extend({

			el: '#mainSVG',

			initialize: function() {

				this.$svg = d3.select(this.el);

				this.batch = dexcomBatches.get(this.id);

				this.listenTo(dexcomBatches, 'change:current', this.updateUnit);

				this.listenTo(this.model, 'change:data', this.updateD);
			},

			updateF: function() {
				console.log('Triggered updateF (day view).');

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
				
				var yScaleForBins = d3.scale.linear()
					// domain is 20 to 420 so that Lo and Hi values changed to 39 and 401 will be included, potentially
					.domain([20, 420])
					// range goes from h to 0 because of the lovely backwards way in which the SVG coord system works
					.range([f.h, 0]);
				var xScaleForBins = d3.scale.linear()
					// domain is 0 to 7 (1 to 8 because of ISO day numbers) so that all days of the week are included
					.domain([1, 8])
					.range([0, f.w]);
				var xScale = d3.scale.linear()
					.domain([0,7])
					.range([0, f.w]);

				var dataByDay = [];

				var dataset = d3.layout.histogram()
					.value(function(d) { return d['blood_glucose']; })
					// group the data into 20 bins
					.bins(yScaleForBins.ticks(20))
					(current['Timestamped Readings']);

				for (i = 0; i < dataset.length; i++) {
					data = d3.layout.histogram()
						.value(function(d) {
							var t = parseDate(d['timestamp']);
							var day = t.getDay();
							if (day == 0) {
								day = 7;
							}
							return day;
						})
						// group the data into bins by time of day
						.bins(xScaleForBins.ticks(7))
						(dataset[i]);
					dataByDay.push(data);
				}

				var yScale = d3.scale.linear()
					.domain([0, dataByDay.length])
					.range([f.h, 0]);
				zScale = d3.scale.linear()
					.domain(d3.extent(dataByDay, function(data) {
						var localMax = d3.max(data, function(d) {
							return d.y;
						});
						return localMax;
					}))
					.range([f.palette.white, f.palette.green])
					.interpolate(d3.interpolateLab);
				var yAxis = d3.svg.axis()
					.scale(yScaleForBins)
					.orient('left');
				var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient('bottom')
					.tickFormat(function(d) {
						var daysOfTheWeek = ['M', 'T', 'W', 'R', 'F', 'S', 'Su', ''];
						return daysOfTheWeek[d];
					});

				for(j = 0; j < dataByDay.length; j++) {
					data = dataByDay[j];
					this.$sm.selectAll(".bin_" + j)
						.data(data)
						.enter()
						.append("svg:rect")
						.attr({
							x: function(d) {
								return xScaleForBins(d.x);
							},
							y: function(d) {
								return yScale(j) - yScale(dataByDay.length - 1);
							},
							width: function(d) {
								return xScaleForBins(2);
							},
							height: function(d) {
								return yScale(dataByDay.length - 1);
							},
							fill: function(d) {
								return zScale(d.y);
							},
							"class": "bin_" + j
						});
				}

				this.$sm.append("svg:g")
					.attr("class", "y axis")
					.call(yAxis);
				this.$sm.append("svg:g")
					.attr("class", "x axis")
					.attr("transform", "translate(" + 0 + "," + f.h + ")")
					.call(xAxis);

				// centers xAxis ticks
				this.$sm.selectAll('.axis.x text')
					.attr("text-anchor", "middle")
					.attr('dx', xScaleForBins(2)/2);
			}

		});

	return DayView;
});