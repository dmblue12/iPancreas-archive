define(['underscore', 'backbone'],
	function(_, Backbone) {
		var FileModel = Backbone.Model.extend({
			defaults: {
				filename: '',
				offset: ''
			}
		});

	return FileModel;
});