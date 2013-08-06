define(['underscore', 'backbone', 'models/dex-file', 'views/loaded'],
	function(_, Backbone, FileModel, LoadedView) {
		var DexcomFiles = Backbone.Collection.extend({

			model: FileModel,

			// TODO: a lot of this code might be more appropriate elsewhere
			submitFiles: function(fileList) {
				var loadWindow = Ti.UI.createWindow({
					id: "loadWindow",
					url: "app://loading.html",
					title: "iPancreas: Loading Data",
					baseURL: "app://loading.html",
					midWidth: 960,
					maxWidth: 960,
					width: 960,
					minHeight: 540,
					maxHeight: 540,
					height: 540,
					maximizable: true,
					minimizable: true,
		            center: true,
		            closeable: true,
		            resizable: false,
		            fullscreen: false,
		            maximized: false,
		            minimized: false,
		            usingChrome: true,
		            visible: true
				});
				loadWindow.open();
				loadWindow.setTopMost(true);
				setTimeout(function() {
					window.StudioReader(fileList, dataDir.nativePath());
					dexcomPath = dataDir.nativePath() + '/dexcom.json';
					console.log(dexcomPath);
					var d = window.DexcomStats(dexcomPath, [true, true, true]);
					d.print_unit_JSON('days');
					d.print_unit_JSON('weeks');
					d.print_unit_JSON('months');
					d.print_unit_JSON('years');
					setTimeout(function() {
						loadWindow.close();
						$('.to-clear').remove();
						app_router.navigate('#/menu/menu');
						var loadedView = new LoadedView();
					}, 250);
				}, 500);
			}

		});

	return DexcomFiles;
});