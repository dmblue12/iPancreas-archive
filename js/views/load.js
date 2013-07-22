define(['jquery', 'underscore', 'backbone', 'lib/bootstrap-fileupload', 'text!templates/form.html'],
	function($, _, Backbone, fileupload, formTemplate) {
		var LoadView = Backbone.View.extend({

			el: '#main',

			render: function() {
				console.log('Rendered LoadView.');
				var html = _.template(formTemplate);
				this.$el.append(html);
			}
		});

		return LoadView;
});