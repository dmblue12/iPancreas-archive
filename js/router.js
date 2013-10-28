define(['jquery', 'underscore', 'backbone', 'models/app', 'collections/dex-files'],
	function($, _, Backbone, AppModel, DexcomFiles) {
		var AppRouter = Backbone.Router.extend({
			routes: {
				'': 'index',
				'menu/:param': 'showMenu',
				'load_data': 'showLoad',
				'summary/:param': 'showSummary',
				'back': 'back',
				'forward': 'forward',
				'exit': 'exit',

				'*actions': 'defaultAction'
			}
		});

		var initialize = function() {
			app_router = new AppRouter;

			appModel = new AppModel();

			var MenuModel = Backbone.Model.extend({});

			var menuModel = new MenuModel();

			var appView;

			var menuView;

			var historyList = appModel.get('forward');

			app_router.on('route:index', function() {
				require(['d3', 'views/app', 'models/dexcom-batch', 'collections/dexcom-batches'],
					function(d3, AppView, DexcomBatch, DexcomBatches) {
					if (!appModel.get('started')) {
						var loadWindow = Ti.UI.createWindow({
							id: "loadWindow",
							url: "app://initializing.html",
							title: "iPancreas: Initializing",
							baseURL: "app://initializing.html",
							midWidth: 960,
							maxWidth: 960,
							width: 960,
							minHeight: 560,
							maxHeight: 560,
							height: 560,
							maximizable: true,
							minimizable: true,
				            center: true,
				            closeable: false,
				            resizable: false,
				            fullscreen: false,
				            maximized: false,
				            minimized: false,
				            usingChrome: false,
				            visible: true
						});
						loadWindow.open();
						loadWindow.setTopMost(true);
						appView = new AppView({model: appModel}, app_router);
						dexcomBatches = new DexcomBatches([]);
						
						// TODO: mbostock has a way of chaining these .json() calls	
						d3.json('file://' + dataDir.nativePath() + '/dexcom_weeks.json',
							function(error, json) {
								if (error) {
									return console.warn(error);
								}
								var dexcomBatch = new DexcomBatch({id: 'weeks'});
								dexcomBatch.set('data', json['Weeks']);
								dexcomBatch.set('current', json['Weeks'][appModel.get('batchIndex')]);
								dexcomBatch.set('next', json['Weeks'][appModel.get('batchIndex') + 1]);
								dexcomBatches.add(dexcomBatch);
							d3.json('file://' + dataDir.nativePath() + '/dexcom_months.json',
								function(error, json) {
									if (error) {
										return console.warn(error);
									}
									var dexcomBatch = new DexcomBatch({id: 'months'});
									dexcomBatch.set('data', json['Months']);
									dexcomBatch.set('current', json['Months'][appModel.get('batchIndex')]);
									dexcomBatch.set('next', json['Months'][appModel.get('batchIndex') + 1]);
									dexcomBatches.add(dexcomBatch);
								d3.json('file://' + dataDir.nativePath() + '/dexcom_years.json',
									function(error, json) {
										if (error) {
											return console.warn(error);
										}
										var dexcomBatch = new DexcomBatch({id: 'years'});
										dexcomBatch.set('data', json['Years']);
										dexcomBatch.set('current', json['Years'][appModel.get('batchIndex')]);
										dexcomBatch.set('next', json['Years'][appModel.get('batchIndex') + 1]);
										dexcomBatches.add(dexcomBatch);
										loadWindow.close();
										setTimeout(function() {
											appView.render();
										}, 500);
								});
							});
						});
					}
					else {
						$('.to-clear').remove();
					}
				});
			});

			app_router.on('route:showMenu', function(file) {
				require(['views/menu'], function (MenuView) {
					menuModel.fetch({
						url: 'assets/json/' + file + '.json',
						success: function() {
							console.log('Successfully loaded ' + file + '.json.');
							if (file === 'init') {
								if (menuView) {
									console.log('Fired existing MenuView option.');
									menuView.render();
								}
								else {
									console.log('Fired new MenuView option.')
									menuView = new MenuView({model: menuModel});
									menuView.render();
								}
							}
						},
						error: function() {
							console.log('Error loading menu JSON.');
						}
					});
				});
				forwardHistory();
			});

			app_router.on('route:showLoad', function() {
				require(['views/load'], function(LoadView) {
					var loadView = new LoadView();
					forwardHistory();
				});
			});

			app_router.on('route:showSummary', function(unit) {
				require([
					'views/main-summary',
					'views/day-summary',
					'views/hour-summary',
					'views/stats-summary',
					'models/summary',
					'models/palette'
					], function(MainSummaryView, DayView, HourView, StatsView, Summary, Palette) {

					var s = new Summary({id: "main"});
					var p = new Palette();
					var batch = dexcomBatches.get(unit);

					s.set('data', batch.get('current'));
					s.set('next-data', batch.get('next'));
					s.set('palette', _.clone(p.attributes));

					var mainSummaryView = new MainSummaryView({id: unit, model: s});
					mainSummaryView.render();
					mainSummaryView.loadFirstUnit();

					var sm1 = new Summary({
						id: "sm1",
						width: 200,
						height: 200,
						x: s.get('width') + s.get('gutter'),
						margin_top: 0,
						margin_right: 0,
						margin_bottom: 20,
						margin_left: 30
					});

					sm1.set('data', batch.get('current'));
					sm1.set('next-data', batch.get('next'));
					sm1.set('palette', _.clone(p.attributes));

					var dayView = new DayView({id: unit, model: sm1});
					dayView.loadFirstUnit();

					var sm2 = new Summary({
						id: "sm2",
						width: 200,
						height: 200,
						x: s.get('width') + s.get('gutter') + sm1.get('width') + sm1.get('gutter'),
						margin_top: 0,
						margin_right: 0,
						margin_bottom: 20,
						margin_left: 30
					});

					sm2.set('data', batch.get('current'));
					sm2.set('next-data', batch.get('next'));
					sm2.set('palette', _.clone(p.attributes));

					var hourView = new HourView({id: unit, model: sm2});
					hourView.loadFirstUnit();

					var stats = new Summary({
						id: "stats",
						width: 420,
						height: 310,
						x: s.get('width') + s.get('gutter'),
						y: s.get('y') + sm1.get('height') + sm1.get('gutter'),
						margin_top: 20,
						margin_right: 20,
						margin_bottom: 20,
						margin_left: 20
					});

					stats.set('data', batch.get('current'));
					stats.set('next-data', batch.get('next'));
					stats.set('palette', _.clone(p.attributes));

					var statsView = new StatsView({id: unit, model: stats});
					statsView.loadFirstUnit();

					forwardHistory();
				});
			});

			app_router.on('route:back', function() {
				console.log('Fired back route.');
				$('.to-clear').remove();
				window.history.go(-2);
				// TODO: do this only once
				$('#forward-button').removeClass('disabled');
			});

			app_router.on('route:forward', function() {
				console.log('Fired forward route.');
				$('.to-clear').remove();
				app_router.navigate('#/' + historyList[historyList.length - 2]);
			});

			app_router.on('route:exit', function() {
				if (confirm('Are you sure you want to quit?')) {
					Ti.App.exit();
				}
				// else is necessary to make it possible to use the exit button even if you change your mind the first time
				else {
					app_router.navigate('#');
				}
			});

			app_router.on('defaultAction', function(action) {
				console.log('No route: ', action);
			});

			var forwardHistory = function() {
				// console.log(historyList);
				historyList.push(Backbone.history.getFragment());
			};

			Backbone.history.start();
		};

		return {
			initialize: initialize
		};
});