define(['jquery', 'underscore', 'backbone', 'lib/bootstrap-fileupload', 'text!templates/form.html'],
	function($, _, Backbone, fileupload, formTemplate) {
		var LoadView = Backbone.View.extend({

			el: '#main',

			initialize: function() {
				console.log('Rendered LoadView.');
				this.$('#mainSVG').hide();
				var html = _.template(formTemplate);
				this.$el.append(html);
			}
		});
	
	return LoadView;
});