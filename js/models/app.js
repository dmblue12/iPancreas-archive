define(['underscore', 'backbone'],
	function(_, Backbone) {
		var AppModel = Backbone.Model.extend({
			defaults: {
				started: false
			},

			start: function() {	
				this.set('started', true);
			}
		});

	return AppModel;
});