define(['jquery', 'underscore', 'backbone', 'models/app', 'collections/dex-files'],
	function($, _, Backbone, AppModel, DexcomFiles) {
		var AppRouter = Backbone.Router.extend({
			routes: {
				'': 'index',
				'menu/:param': 'showMenu',
				'load_data': 'showLoad',
				'loading': 'showLoading',
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

			var appView;

			var menuModel = new MenuModel();

			var menuView;

			var historyList = appModel.get('forward');

			app_router.on('route:index', function() {
				require(['views/app'], function(AppView) {
					if (!appModel.get('started')) {
						appView = new AppView({model: appModel}, app_router);
					}
					else {
						$('.to-clear').remove();
					}
					appView.render();
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
					loadView = new LoadView();
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