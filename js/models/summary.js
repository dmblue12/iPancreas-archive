define(['underscore', 'backbone'],
	function(_, Backbone) {
		var Summary = Backbone.Model.extend({
			defaults: {
				width: 860,
				height: 530,
				x: 0,
				y: 110,
				gutter: 20,
				margin_top: 20,
				margin_right: 20,
				margin_bottom: 20,
				margin_left: 80
			}
		});

	return Summary;
});