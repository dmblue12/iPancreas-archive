define(['jquery', 'underscore', 'backbone', 'd3', 'text!templates/locate.html'],
	function($, _, Backbone, d3, locateHTML) {
		var StatsView = Backbone.View.extend({

			el: '#mainSVG',

			initialize: function() {

				this.$svg = d3.select(this.el);

				this.batch = dexcomBatches.get(this.id);

				this.listenTo(dexcomBatches, 'change:current', this.updateUnit);

				this.listenTo(this.model, 'change:data', this.updateD);
			},

			updateF: function() {
				console.log('Triggered updateF (summary stats).');

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

				this.$stats = d3.select("#" + f.id);

				var current = this.model.get('data');

				var previous = this.model.get('previous-data');

				var next = this.model.get('next-data');

				this.$stats.append("text")
					.attr("class", "stats-head")
					.text("Summary Statistics");

				var textPos = 65;

				var lineHeight = 30;

				lineScale = d3.scale.linear()
					.domain([20, 420])
					.range([0, f.w]);

				this.$stats.append("svg:g")
					.attr("id", "bgLine");

				this.$bgLine = d3.select("#bgLine");

				this.$bgLine.append("line")
					.attr({
						x1: 0,
						x2: f.w,
						y1: textPos + 5,
						y2: textPos + 5,
						"stroke-width": 1,
						stroke: f.palette.black
					});

				this.$bgLine.append("svg:g")
					.attr("id", "min")
					.append("svg:circle")
					.attr({
						cx: lineScale(current['Summary Statistics']['Min']),
						cy: textPos + 5,
						r: 5,
						fill: f.palette.yellow
					});

				this.$min = d3.select("#min");

				this.$bgLine.append("svg:g")
					.attr("id", "max")
					.append("svg:circle")
					.attr({
						cx: lineScale(current['Summary Statistics']['Max']),
						cy: textPos + 5,
						r: 5,
						fill: f.palette.red
					});

				this.$max = d3.select("#max");

				this.$bgLine.append("svg:g")
					.attr("id", "median")
					.append("svg:circle")
					.attr({
						cx: lineScale(current['Summary Statistics']['Median']),
						cy: textPos + 5,
						r: 5,
						fill: f.palette.green
					});

				this.$median = d3.select("#median");

				this.$min.append("text")
					.attr({
						x: lineScale(current['Summary Statistics']['Min']),
						y: textPos + 30,
						"class": "txt",
						"text-anchor": "end"
					})
					.text("Min: " + current['Summary Statistics']['Min']);

				this.$max.append("text")
					.attr({
						x: lineScale(current['Summary Statistics']['Max']),
						y: textPos + 30,
						"class": "txt",
						"text-anchor": "start"
					})
					.text("Max: " + current['Summary Statistics']['Max']);

				this.$median.append("text")
					.attr({
						x: lineScale(current['Summary Statistics']['Median']),
						y: textPos - 15,
						"class": "txt",
						"text-anchor": "middle"
					})
					.text("Median: " + current['Summary Statistics']['Median']);

				textPos += lineHeight * 2 + 5;

				this.$stats.append("text")
					.attr("x", f.w)
					.attr("y", textPos)
					.attr("text-anchor", "end")
					.attr("class", "stats")
					.attr("id", "pgs")
					.text("Patient Glycemic Status: " + current['Summary Statistics']['Patient Glycemic Status']);

				textPos += lineHeight;

				this.$stats.append("text")
					.attr("x", f.w)
					.attr("y", textPos)
					.attr("text-anchor", "end")
					.attr("class", "stats")
					.attr("id", "gvi")
					.text("Glycemic Variability Index: " + current['Summary Statistics']['Glycemic Variability Index']);

				textPos += lineHeight;

				this.$stats.append("text")
					.attr("x", f.w)
					.attr("y", textPos)
					.attr("text-anchor", "end")
					.attr("class", "stats")
					.attr("id", "mean")
					.text("Mean Blood Glucose: " + current['Summary Statistics']['Mean']);

				textPos += lineHeight;

				this.$stats.append("text")
					.attr("x", f.w)
					.attr("y", textPos)
					.attr("text-anchor", "end")
					.attr("class", "stats")
					.attr("id", "sd")
					.text("Standard Deviation: " + current['Summary Statistics']['Standard Deviation']);

				textPos += lineHeight + 10;

				try {
					var mean_change = current['Summary Statistics']['Mean'] - previous['Summary Statistics']['Mean'];
				}
				catch (ReferenceError) {
					console.log("No previous data.");
				}

				this.$stats.append("text")
					.attr("y", textPos)
					.attr("text-anchor", "start")
					.attr("class", "stats")
					.attr("id", "prog")
					.text(function() {
						if (mean_change >= 0) {
							return "Progress: +" + mean_change + " mean blood glucose";
						}
						else if (mean_change < 0) {
							return "Progress: +" + mean_change + " mean blood glucose";
						}
						else {
							return "Progress: NA";
						}
					});
			},

			updateUnit: function() {
				console.log('Triggered updateUnit (summary stats)!');

				// updating model's data
				this.model.set('data', this.batch.get('current'));

				this.model.set('previous-data', this.batch.get('previous'));

				this.model.set('next-data', this.batch.get('next'));

				console.log(this.model.get('previous-data'));

				var current = this.model.get('data');

				var previous = this.model.get('previous-data');

				var next = this.model.get('next-data');

				this.$min.select("circle")
					.transition()
					.attr("cx", lineScale(current['Summary Statistics']['Min']));
				this.$min.select("text")
					.transition()
					.attr("x", lineScale(current['Summary Statistics']['Min']))
					.text("Min: " + current['Summary Statistics']['Min']);

				this.$max.select("circle")
					.transition()
					.attr("cx", lineScale(current['Summary Statistics']['Max']));
				this.$max.select("text")
					.transition()
					.attr("x", lineScale(current['Summary Statistics']['Max']))
					.text("Max: " + current['Summary Statistics']['Max']);

				this.$median.select("circle")
					.transition()
					.attr("cx", lineScale(current['Summary Statistics']['Median']));
				this.$median.select("text")
					.transition()
					.attr("x", lineScale(current['Summary Statistics']['Median']))
					.text("Median: " + current['Summary Statistics']['Median']);

				try {
					var pgs_change = current['Summary Statistics']['Patient Glycemic Status'] - previous['Summary Statistics']['Patient Glycemic Status'];
					var gvi_change = current['Summary Statistics']['Glycemic Variability Index'] - previous['Summary Statistics']['Glycemic Variability Index']
					var mean_change = current['Summary Statistics']['Mean'] - previous['Summary Statistics']['Mean'];
					var sd_change = current['Summary Statistics']['Standard Deviation'] - previous['Summary Statistics']['Standard Deviation'];
					var median_change = current['Summary Statistics']['Median'] - previous['Summary Statistics']['Median'];
				}
				catch (ReferenceError) {
					console.log("No previous data.");
				}

				var changes = [pgs_change, gvi_change, mean_change, sd_change, median_change];

				var count = 0;

				for (i = 0; i < changes.length; i++) {
					if (changes[i] < 0) {
						count += 1;
					}
				}

				d3.select('#prog')
					.text(function() {
						if (count > 0) {
							return "Progress: " + count + "/5 statistics improved!";
						}
						else {
							return "Progress: NA";
						}
					});
			}

		});

	return StatsView;
});