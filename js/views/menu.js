define(['jquery', 'underscore', 'backbone', 'd3'],
	function($, _, Backbone, d3) {
		var MenuView = Backbone.View.extend({

			el: '#mainSVG',

			render: function() {
				console.log('Rendered MenuView.');

				this.$svg = d3.select(this.el);

				this.$svg.selectAll('circle')
					.data(["start"])
					.enter()
					.append('circle')
					.attr('id', 'startCircle')
					.style('display', 'none')
					.attr('cx', 800/2)
					.attr('cy', 400/2)
					.attr('r', 100)
					.attr('fill', '#0088CC');

				this.$svg.selectAll('text')
					.data(["start"])
					.enter()
					.append('text')
					.text(function(d) {
						return d;
					})
					.attr('x', 800/2)
					.attr('y', 400/2)
					.attr('fill', 'white')
					.attr('font-size', '36px')
					.attr('font-family', 'Ultra')
					.attr('text-anchor', 'middle')
					.attr('letter-spacing', '.1em')
					.attr('dominant-baseline', 'middle');

				this.$('#startCircle').delay(2500).fadeIn(2500);
			}
		});

		return MenuView;
});