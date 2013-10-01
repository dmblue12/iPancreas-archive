define(['jquery', 'underscore', 'backbone', 'd3', 'models/focused-svg', 'text!templates/locate.html'],
	function($, _, Backbone, d3, FocusedSVG, locateHTML) {
		var SummaryView = Backbone.View.extend({

			el: '#mainSVG',

			months: {
				'0': 'January',
				'1': 'February',
				'2': 'March',
				'3': 'April',
				'4': 'May',
				'5': 'June',
				'6': 'July',
				'7': 'August',
				'8': 'September',
				'9': 'October',
				'10': 'November',
				'11': 'December'
			},

			initialize: function() {
				console.log('Initialized SummaryView.');

				this.$svg = d3.select(this.el);

				this.batch = dexcomBatches.get(this.id);

				switch (this.id) {
					case 'weeks':
						this.headline = ' by Week';
						this.unit_of = 'Week of ';
						this.previous = 'Previous Week';
						this.next = 'Next Week';
						break;
					case 'months':
						this.headline = ' by Month';
						this.unit_of = 'Month of ';
						this.previous = 'Previous Month';
						this.next = 'Next Month';
						break;
					case 'years':
						this.headline = ' by Year';
						this.unit_of = 'Year of ';
						this.previous = 'Previous Year';
						this.next = 'Next Year';
						break;
				}

				this.$el.empty();
				this.$el.show();

				this.listenTo(dexcomBatches, 'change:current', this.updateUnit);

				this.listenTo(this.model, 'change:data', this.updateF);
			},

			render: function() {
				console.log('Rendered SummaryView.');
				$('#main').prepend(_.template(locateHTML));
				$('#summary_head').html('Dexcom Data: Summaries' + this.headline);
				$('#previous-unit').html(this.previous);
				$('#next-unit').html(this.next);
			},

			updateF: function() {
				console.log('Triggered updateF.');

				f = _.clone(this.model.attributes);

				f.h = f.height - f.margin_top - f.margin_bottom;

				f.w = f.width - f.margin_left - f.margin_right;

				f.pad = f.margin_left - f.margin_right;

				d = this.model.get('data');
				// this version of WebKit doesn't seem to be able to parse straight from date strings
				// hence doing it myself
				// TODO: also maybe move date parsing to some kind of utility module?				
				dateStr = d['Start Date'];
				startYear = dateStr.substring(0,4);
				startMonth = dateStr.substring(5,7) - 1;
				switch (this.id) {
					case 'weeks':
						startCal = dateStr.substring(8,10);
						startDate = new Date(startYear, startMonth, startCal);
						// day of the week
						var startDay = startDate.getDay();
						var diff = startDay - 1;
						// TODO: WRONG
						if (startDay !== 1) {
							startDate = new Date(startYear, startMonth, startCal - diff);
						}
						$('#unit-of').html(this.unit_of + startDate.toDateString());
						break;
					case 'months':
						$('#unit-of').html(this.unit_of + this.months[startMonth] + ', ' + startYear);
						break;
					case 'years':
						$('#unit-of').html(this.unit_of + startYear); 
				}
			},

			loadFirstUnit: function() {

				this.updateF();

				console.log(this.model.toJSON());

				// TODO: comment this out in production!
				// this is just to be able to see the borders of my #inner SVG
				// this.$svg.append("svg:rect")
				// 	.attr("width", f.width)
				// 	.attr("height", f.height)
				// 	.attr("x", f.x)
				// 	.attr("y", f.y)
				// 	.attr("id", "show");

				this.$svg.append("svg:svg")
					.attr("width", f.width)
					.attr("height", f.height)
					.attr("x", f.x)
					.attr("y", f.y)
					.attr("id", "inner")
					.append("svg:g")
					.attr("id", "focus")
					.attr("transform", "translate(" + f.margin_left + "," + f.margin_top + ")");

				this.$focus = d3.select('#focus');

				var current = this.model.get('data');

				yScale = d3.scale.linear()
					// domain is 20 to 420 so that Lo and Hi values changed to 39 and 401 will be included, potentially
					.domain([20, 420])
					// range goes from h to 0 because of the lovely backwards way in which the SVG coord system works
					.range([f.h, 0]);

				var dataset = d3.layout.histogram()
					.value(function(d) { return d; })
					// group the data into 20 bins
					.bins(yScale.ticks(20))
					(current['Blood Glucose Values']);

				xScale = d3.scale.linear()
					// domain is 0 to the max frequency of BG readings in a bin
					// (which is d.y since the histogram layout is designed to do vertical, not horizontal histograms)
					.domain([0, d3.max(dataset, function(d) { return d.y; })])
					.range([0, f.w]);

				redScale = d3.scale.linear()
					.domain([0, d3.max(dataset, function(d) { return d.y; })])
					.range(['#000000', '#BD362F'])
					.interpolate(d3.interpolateHcl);

				blueScale = d3.scale.linear()
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
						"class": "bar"
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
					});

				this.$focus.append("svg:g")
					.attr("class", "y axis")
					.call(this.yAxis);

				this.$focus.append("svg:text")
					.attr("class", "y lbl")
					// "laterally" centers labels (i.e., horizontally, but not really since it's rotated)
					.attr("text-anchor", "middle")
					// because of the rotation applied below, y-coord is really x-coord
					// -pad "undoes" part of the effects of the translate(margin.left, margin.top) to place the axis label at the edge of the margin
					.attr("y", -f.pad)
					// because of the rotation applied below x-coord is really y-coord
					.attr("x", -f.h/2)
					// makes baseline of text the top of the letters
					.attr('alignment-baseline', 'hanging')
					.attr("transform", "rotate(-90)")
					.text("Blood Glucose in mg/dL");

				// legend
				var legendW = 160;
				var legendH = 60;
				var legendXPos = f.w - legendW - f.margin_right;
				// def linear gradient for legend: blue
				blueLinearDef = this.$focus.append("svg:defs")
					.append("svg:linearGradient")
					.attr({
						id: "blueLinear",
						x1: "0%",
						y1: "0%",
						x2: "100%",
						y2: "0%",
						spreadMethod: "pad"
					});
				blueLinearDef.append("svg:stop")
					.attr("offset", "0%")
					.attr("stop-color", f.palette.dark_blue)
					.attr("stop-opacity", "1");
				blueLinearDef.append("svg:stop")
					.attr("offset", "100%")
					.attr("stop-color", "#000000")
					.attr("stop-opacity", "1");
				// def linear gradient for legend: red
				redLinearDef = this.$focus.append("svg:defs")
					.append("svg:linearGradient")
					.attr({
						id: "redLinear",
						x1: "0%",
						y1: "0%",
						x2: "100%",
						y2: "0%",
						spreadMethod: "pad"
					});
				redLinearDef.append("svg:stop")
					.attr("offset", "0%")
					.attr("stop-color", f.palette.red)
					.attr("stop-opacity", "1");
				redLinearDef.append("svg:stop")
					.attr("offset", "100%")
					.attr("stop-color", "#000000")
					.attr("stop-opacity", "1");

				var targetLegend = this.$focus.append("svg:g")
					.attr({
						transform: "translate(" + legendXPos + "," + 0 + ")",
						width: legendW,
						height: legendH
					});
				// add gradient square for target range legend
				targetLegend.append("svg:rect")
					.attr("x", 0)
					.attr("y", 5)
					.attr("rx", 5)
					.attr("ry", 5)
					.attr("width", legendW)
					// each legend bar is 1/3 of total legend height, final third serves as padding
					.attr("height", legendH / 3)
					.attr("stroke", "#DCDCDC")
					.attr("stroke-width", 3)
					.style("fill", "url(#blueLinear)");
				//add legend text: blue
				targetLegend.append("svg:text")
					// center text in legend bar
					.attr("x", legendW / 2)
					.attr("y", 16)
					.attr("class", "txt")
					.attr("text-anchor", "middle")
					.attr("dominant-baseline", "middle")
					.attr("fill", "#DCDCDC")
					.text("In Target Range");
				// add gradient square for out of target range legend
				targetLegend.append("svg:rect")
					.attr("x", 0)
					.attr("y", legendH / 2 + 5)
					.attr("rx", 5)
					.attr("ry", 5)
					.attr("width", legendW)
					.attr("height", legendH / 3)
					.attr("stroke", "#DCDCDC")
					.attr("stroke-width", 3)
					.style("fill", "url(#redLinear)");
				//add legend text: red
				targetLegend.append("svg:text")
					.attr("x", legendW / 2)
					.attr("y", legendH / 2 + 16)
					.attr("class", "txt")
					.attr("text-anchor", "middle")
					.attr("dominant-baseline", "middle")
					.attr("fill", "#DCDCDC")
					.text("Out of Target Range");
			},

			updateUnit: function() {
				console.log('Triggered updateUnit!');

				// updating model's data
				this.model.set('data', this.batch.get('current'));

				console.log(this.model.toJSON());

				var current = this.model.get('data');

				// updating dataset
				var dataset = d3.layout.histogram()
					.value(function(d) { return d; })
					// group the data into 20 bins
					.bins(yScale.ticks(20))
					(current['Blood Glucose Values']);

				// updating scales; yScale is fixed, doesn't need updated
				xScale.domain([0, d3.max(dataset, function(d) { return d.y; })])
					.range([0, f.w]);

				redScale.domain([0, d3.max(dataset, function(d) { return d.y; })])
					.range(['#000000', '#BD362F'])
					.interpolate(d3.interpolateHcl);

				blueScale.domain([0, d3.max(dataset, function(d) { return d.y; })])
					.range(['#000000', '#0044CC'])
					.interpolate(d3.interpolateHcl);

				this.$focus.selectAll("rect")
					.data(dataset)
					.transition()
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
					});
			}

		});

	return SummaryView;
});