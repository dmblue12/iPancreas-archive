define(['jquery', 'underscore', 'backbone', 'text!templates/dexcom-uploader.html'],
	function($, _, Backbone, dexcomUploader) {
		var DexcomLoadView = Backbone.View.extend({

			className: "control-group",

			events: {
				"click [id^='choose_dexcom']" : "chooseFile",
				"click .offset" : "toggleOffset"
			},

			initialize: function() {
				this.tmpl = _.template(dexcomUploader);
			},

			render: function() {
				this.$el.html(this.tmpl({id: this.id}));

				this.$('#upload-additional' + this.id).on('click', function() {
					if (!($('a', this).hasClass('disabled'))) {
						$(this).hide();
					}
				});

				return this;
			},

			chooseFile: function() {
				var fileName;
				w.openFileChooserDialog(function(fileList) {
					fileName = fileList[0];
				}, {
					multiple: false,
					title: "Choose a Dexcom file",
					// TODO: make this dependent on radio button value?
					types: ['csv', 'xml']
				});
				if (fileName !== undefined) {			
					this.$('#dexcom_file' + this.id).html(fileName);
					this.$("[id^='upload-additional'] a").toggleClass('disabled');
					$('#submit-button').removeClass('disabled');
				}
			},

			toggleOffset: function() {
				this.$('.offset').toggleClass('active');
			}
		});

	return DexcomLoadView;

});

