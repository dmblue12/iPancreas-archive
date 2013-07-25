define(['jquery', 'underscore', 'backbone', 'text!templates/form.html'],
	function($, _, Backbone, formTemplate) {
		var LoadView = Backbone.View.extend({

			el: '#main',

			initialize: function() {
				console.log('Rendered LoadView.');
				this.$('#mainSVG').hide();
				var html = _.template(formTemplate);
				this.$el.append(html);
				this.$('#load-data').on('submit', function() {
					console.log($('input[name=dexcom_format]:checked').val());
					// return false; necessary to prevent page refresh
					return false;
				});
				this.$('#choose_dexcom').on('click', function() {
					w.openFileChooserDialog(function(fileList) {
						var fileLen = fileList.length;
						var fileMessage;
						if (fileList.length > 1) {
							fileMessage = fileLen + " files selected."
						}
						else {
							fileMessage = fileList[0];
						}
						$('.file-preview').html(fileMessage);
					}, {
						multiple: true,
						title: "Choose a Dexcom file",
						// TODO: make this dependent on radio button value?
						types: ['csv', 'xml']
					});
				});
			}
		});
	
	return LoadView;
});