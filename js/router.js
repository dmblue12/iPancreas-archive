define(['jquery', 'underscore', 'backbone', 'models/app'],
	function($, _, Backbone, AppModel) {
		var AppRouter = Backbone.Router.extend({
			routes: {
				'': 'index',
				'menu/:param': 'showMenu',
				'load': 'showLoad',
				'back': 'back',
				'forward': 'forward',
				'exit': 'exit',

				'*actions': 'defaultAction'
			}
		});

		var initialize = function() {
			app_router = new AppRouter;

			var appModel = new AppModel();

			var MenuModel = Backbone.Model.extend({});

			var appView;

			var menuModel = new MenuModel();

			var menuView;

			app_router.on('route:index', function() {
				require(['views/app'], function(AppView) {
					if (!appModel.get('started')) {
						appView = new AppView({model: appModel}, app_router);
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
									this.$('g').remove();
									this.$('line').remove();
									menuView.render();
								}
								else {
									console.log('Fired this option.')
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
			});

			app_router.on('route:showLoad', function() {
				var loadView = new LoadView();
				loadView.render();
			});

			app_router.on('route:back', function() {
				console.log('Fired back route.');
				window.history.back();
				$('#forward-button').removeClass('disabled');
			});

			app_router.on('route:forward', function() {
				console.log('Fired forward route.');
				window.history.back();
			});

			app_router.on('route:exit', function() {
				if (confirm('Are you sure you want to quit?')) {
					Ti.App.exit();
				}
				// else is necessary to make it possible to use the exit button even if you change your mind the first time
				else {
					app_router.navigate('#', { trigger: false });
				}
			});

			app_router.on('defaultAction', function(action) {
				console.log('No route: ', action);
			});

			Backbone.history.start();
		};

		return {
			initialize: initialize
		};
	});