define(['jquery', 'underscore', 'backbone', 'd3', 'text!json/palette.json'],
	function($, _, Backbone, d3, palette) {
		var MenuView = Backbone.View.extend({

			colors: function(i) {
				var p = JSON.parse(palette);

				this.palette = [
					p["dark_blue"],
					p["red"],
					p["orange"],
					p["green"],
					p["light_blue"]
				];
				
				var index = i + 1;

				if (index <= 5) {
					return this.palette[index - 1];
				}
				else {
					index = index % 5;
					return this.palette[index - 1];
				}
			},

			el: '#mainSVG',

			events: {
				'click .menuCircle': 'loadGraph'
			},

			forceInit: function() {
				var colors = this.colors;

				this.dataset = this.model.get('graph');

				this.force = d3.layout.force()
					.nodes(this.dataset.nodes)
					.links(this.dataset.edges)
					.size([800, 400])
					.linkDistance([200])
					.charge([-200])
					.start();

				var edges = this.$svg.selectAll('line')
					.data(this.dataset.edges)
					.enter()
					.append('line')
					.style('stroke', '#CCC')
					.style('stroke-width', '1');

				var nodes = this.$svg.selectAll('.node')
					.data(this.dataset.nodes)
					.enter()
					.append('g')
					.attr('class', 'menuCircle')
					.call(this.force.drag);

				nodes.append('circle')
					.attr('r', 75)
					.style('fill', function(d, i) {
						return colors(i);
					});

				nodes.append('text')
					.text(function(d) {
						return d.title;
					})
					.attr('fill', 'white')
					.attr('font-size', '24px')
					.attr('font-family', 'Ultra')
					.attr('text-anchor', 'middle')
					.attr('letter-spacing', '.1em')
					.attr('dominant-baseline', 'middle');

				this.force.on('tick', function() {
					edges.attr('x1', function(d) { return d.source.x; })
						.attr('y1', function(d) { return d.source.y; })
						.attr('x2', function(d) { return d.target.x; })
						.attr('y2', function(d) { return d.target.y; });

					nodes.attr('transform', function(d) {
						return "translate(" + d.x + "," + d.y + ")";
					});
				});
			},

			forceUpdate: function() {

			},

			initialize: function() {

				this.$svg = d3.select(this.el);

				this.forceInit();

				this.model.set('started', true);
			},

			loadGraph: function() {

			},

			render: function() {
				console.log('Rendered MenuView.');
			}
		});

	return MenuView;
});