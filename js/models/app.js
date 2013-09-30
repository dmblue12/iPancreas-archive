define(['underscore', 'backbone', 'models/palette'],
	function(_, Backbone, Palette) {
		var AppModel = Backbone.Model.extend({
			defaults: {
				started: false,
				forward: [],
				palette: new Palette()
			},

			start: function() {	
				this.set('started', true);
			}
		});

	return AppModel;
});