define(['jquery', 'underscore', 'backbone', 'd3', 'views/menu-node'],
	function($, _, Backbone, d3, MenuNode) {
		var MenuView = Backbone.View.extend({

			el: '#mainSVG',

			forceInit: function(circleSize, fontSize, textColor, textAnchor) {

				this.$el.show();

				var p = appModel.get('palette');

				var colors = [
					p.get('dark_blue'),
					p.get('red'),
					p.get('yellow'),
					p.get('green'),
					p.get('light_blue')
				];

				var dataset = this.model.get('graph');

				var force = d3.layout.force()
					.nodes(dataset.nodes)
					.links(dataset.edges)
					.size([1300, 640])
					.linkDistance(function(d) {
						if (d.source.title === 'iPancreas') {
							return [200];
						}
						else {
							return [100];
						}
					})
					.charge(function(d) {
						try {
							if (d.source.title === 'iPancreas') {
								return [-600];
							}
							else {
								return [-300];
							}
						}
						catch(TypeError) {
							return [-600];
						}
					})
					.start();

				force.on('tick', function() {
					edges.attr('x1', function(d) { return d.source.x; })
						.attr('y1', function(d) { return d.source.y; })
						.attr('x2', function(d) { return d.target.x; })
						.attr('y2', function(d) { return d.target.y; });

					nodes.attr('transform', function(d) {
						return "translate(" + d.x + "," + d.y + ")";
					});
				});

				var edges = this.$svg.selectAll('line')
					.data(dataset.edges)
					.enter()
					.append('line')
					.style('stroke', p.get('light_gray'))
					.style('stroke-width', '3');

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
					.attr('r', function(d) {
						if (d.group.indexOf('non-leaf') !== -1) {
							return 1.5 * circleSize;
						}
						else {
							return circleSize;
						}
					})
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
					.attr('fill', p.get(textColor))
					.attr('font-size', fontSize + 'px')
					.attr('font-family', 'ChunkFive')
					.attr('text-anchor', textAnchor)
					.attr('letter-spacing', '.15em')
					.attr('dominant-baseline', 'middle');

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