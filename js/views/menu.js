define(['jquery', 'underscore', 'backbone', 'd3', 'views/menu-node', 'text!json/palette.json'],
	function($, _, Backbone, d3, MenuNode, palette) {
		var MenuView = Backbone.View.extend({

			el: '#mainSVG',

			forceInit: function(circleSize, fontSize, textColor, textAnchor) {

				this.$el.show();

				var p = JSON.parse(palette);

				var colors = [
					p["dark_blue"],
					p["red"],
					p["orange"],
					p["green"],
					p["light_blue"]
				];

				dataset = this.model.get('graph');

				force = d3.layout.force()
					.nodes(dataset.nodes)
					.links(dataset.edges)
					.size([1300, 640])
					.linkDistance([175])
					.charge([-600])
					.start();

				var edges = this.$svg.selectAll('line')
					.data(dataset.edges)
					.enter()
					.append('line')
					.style('stroke', '#CCC')
					.style('stroke-width', '1');

				var nodes = this.$svg.selectAll('.node')
					.data(dataset.nodes)
					.enter()
					.append('g')
					.attr('class', 'menuCircle')
					.attr('class', function(d) {
						return d.group;
					})
					.attr('id', function(d) {
						return d.title.toLowerCase().replace(' ', '_');
					})
					.call(force.drag);

				nodes.each(function() {
					var menuNode = new MenuNode({el: this});
				});

				nodes.append('circle')
					.attr('r', circleSize)
					.style('fill', function(d) {
						if (d.id < 5) {
							return colors[d.id];	
						}
						else {
							for(j = 0; j < dataset.edges.length; j++) {
								if (dataset.edges[j].target.id === d.id) {
									return colors[dataset.edges[j].source.id];
								}
							}
						}
					});

				nodes.append('text')
					.text(function(d) {
						return d.title;
					})
					.attr('class', 'menu-text')
					.attr('fill', textColor)
					.attr('font-size', fontSize + 'px')
					.attr('font-family', 'ChunkFive')
					.attr('text-anchor', textAnchor)
					.attr('letter-spacing', '.15em')
					.attr('dominant-baseline', 'middle');

				force.on('tick', function() {
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
				console.log('Fired force update.');
				this.$el.empty();
				this.forceInit(15, 16, 'black', 'right');
			},

			initialize: function() {

				this.$svg = d3.select(this.el);

				this.listenTo(this.model, 'change:graph', this.forceUpdate);
			},

			render: function() {

				this.forceInit(75, 36, 'white', 'middle');
			}
		});

	return MenuView;
});