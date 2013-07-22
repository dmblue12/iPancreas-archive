define(['jquery', 'underscore', 'backbone', 'models/app'],
	function($, _, Backbone, AppModel) {
		var AppRouter = Backbone.Router.extend({
			routes: {
				'': 'index',
				'menu': 'showMenu',
				'load': 'showLoad',

				'*actions': 'defaultAction'
			}
		});

		var initialize = function() {
			var app_router = new AppRouter;

			var appModel = new AppModel();

			var MenuModel = Backbone.Model.extend({});
			
			var menuModel = new MenuModel();

			menuModel.fetch({
				url: 'assets/json/init.json',
				success: function() {
					console.log('Successfully loaded init.json.');
				},
				error: function() {
					console.log('Error loading init.json.');
				}
			});

			var appView;

			var menuView;

			app_router.on('route:index', function() {
				require(['views/app'], function(AppView) {
					if (!appModel.get('started')) {
						appView = new AppView({model: appModel}, app_router);
					}
					appView.render();
				});
			});

			app_router.on('route:showMenu', function() {
				require(['views/menu'], function (MenuView) {
					if (!menuModel.get('started')) {
						menuView = new MenuView({model: menuModel});
					}
					menuView.render();
				});
			});

			app_router.on('route:showLoad', function() {
				var loadView = new LoadView();
				loadView.render();
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