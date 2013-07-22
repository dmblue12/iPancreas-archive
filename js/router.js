define(['jquery', 'underscore', 'backbone', 'views/menu', 'views/load'],
	function($, _, Backbone, MenuView, LoadView) {
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

			app_router.on('route:index', function() {
				require(['views/app'], function(AppView) {
					var appView = new AppView();
					appView.render();
					// TODO: this should happen in AppView, but I need to figure out how to pass the router there
					app_router.navigate('#/menu', { trigger: true });
				});
			});

			app_router.on('route:showMenu', function() {
				var Menu = Backbone.Model.extend({});
				var menu = new Menu();
				menu.fetch({
					url: 'assets/json/menu.json',
					success: function() {
						console.log('Successfully loaded menu.json.');
						var menuView = new MenuView({model: menu});
						menuView.render();
					},
					error: function() {
						console.log('There was an error loading menu.json.');
					}
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