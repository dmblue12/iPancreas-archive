define(['underscore', 'backbone', 'models/dex-file'],
	function(_, Backbone, FileModel) {
		var DexcomFiles = Backbone.Collection.extend({

			model: FileModel,

			submitFiles: function(fileList) {
				setTimeout(function() {
					window.StudioReader(fileList, dataDir.nativePath());
				}, 500);
			}

		});

	return DexcomFiles;
});