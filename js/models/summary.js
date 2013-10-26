define(['underscore', 'backbone'],
	function(_, Backbone) {
		var Summary = Backbone.Model.extend({
			defaults: {
				width: 860,
				height: 530,
				x: 0,
				y: 100,
				margin_top: 20,
				margin_right: 20,
				margin_bottom: 20,
				margin_left: 80,
				sm_width: 200,
				sm_height: 200,
				sm_margin: 10
			}
		});

	return Summary;
});