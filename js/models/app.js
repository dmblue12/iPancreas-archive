define(['underscore', 'backbone', 'models/palette'],
	function(_, Backbone, Palette) {
		var AppModel = Backbone.Model.extend({
			defaults: {
				started: false,
				forward: [],
				palette: new Palette(),
				batchIndex: 0
			},

			start: function() {	
				this.set('started', true);
			}
		});

	return AppModel;
});