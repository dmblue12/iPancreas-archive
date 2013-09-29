define(['underscore', 'backbone'],
	function(_, Backbone) {
		var Palette = Backbone.Model.extend({
			defaults: {
				dark_blue: '#0044CC',
				light_blue: '#0088CC',
				green: '#51A351',
				yellow: '#F89406',
				red: '#BD362F',
				name: 'Bootstrap'
			}
		});

	return Palette;
});