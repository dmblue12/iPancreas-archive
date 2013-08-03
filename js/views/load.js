define([
	'jquery',
	'underscore',
	'backbone',
	'lib/bootstrap.min',
	'text!templates/form.html',
	'models/dex-file',
	'collections/dex-files',
	'views/dexcom-uploader'],
	function($, _, Backbone, Bootstrap, formTemplate, FileModel, DexcomFiles, DexcomLoadView) {
		var LoadView = Backbone.View.extend({

			el: '#main',

			events: {
				"click [id^='upload-additional'] a:not(.disabled)": "newDexcomLoader",
				"click #submit-button:not(.disabled)": "loadingPage"
			},

			initialize: function() {
				$("[id^='welcome']").remove();
				console.log('Rendered LoadView.');
				this.$('#mainSVG').hide();
				this.$el.append(_.template(formTemplate));
				this.collection = new DexcomFiles();

				var loadView = new DexcomLoadView({id: this.collection.length});
				this.$('#dexcom-upload-container').append(loadView.render().el);

				this.$('#load-data').on('submit', function() {
					return false;
				});

				this.listenTo(this.collection, 'submit', this.submitFiles);
			},

			newDexcomLoader: function() {
				var i = this.collection.length;
				var fileModel = new FileModel({
					id: i + 1,
					filename: this.$('#dexcom_file' + i).html()
				});
				this.collection.add(fileModel);
				this.$('#submit-button').addClass('disabled');
				var loadView = new DexcomLoadView({id: this.collection.length});
				this.$('#dexcom-upload-container').append(loadView.render().el);
			},

			loadingPage: function() {
				var i = this.collection.length;
				var dexcomCollection = this.collection;
				if (i > 0) {
					for (j = 0; j <= i; j++) {
						var fileModel = new FileModel({
							id: j + 1,
							format: $("input[name='dexcom_format']").val(),
							filename: $('#dexcom_file' + j).html(),
							offset: $('#offsets' + j + ' .offset.active').attr('sign') + $("input[name='dexcom_offset" + j + "']").val()
						});
						this.collection.add(fileModel, {merge: true});						
					};						
				}
				else {
					var fileModel = new FileModel({
						id: i + 1,
						format: $("input[name='dexcom_format']").val(),
						filename: $('#dexcom_file' + i).html(),
						offset: $('#offsets' + i + ' .offset.active').attr('sign') + $("input[name='dexcom_offset" + i + "']").val()
					});
					this.collection.add(fileModel);
				}
				this.$('form').hide(function() {
					dexcomCollection.trigger('submit');
				});
				this.$('#mainSVG').empty();
				this.$('#mainSVG').show();
			},

			submitFiles: function() {
				var fileList = [];
				this.collection.forEach(function(model) {
					offset = model.get('offset');
					if ((offset !== '+') && (offset !== '-')) {
						fileList.push([model.get('filename'), offset]);
					}
					else {
						fileList.push([model.get('filename'), '']);
					}
				});
				this.collection.submitFiles(fileList);
			}
		});
	
	return LoadView;
});