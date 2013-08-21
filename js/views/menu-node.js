define(['jquery', 'underscore', 'backbone'],
	function($, _, Backbone) {
		var MenuNode = Backbone.View.extend({

			events: {
				'click': 'action'
			},

			initialize: function() {
				// jQuery hasClass() doesn't work for SVG
				// TODO: factor fixes for this out into another .js script
				var classes = this.$el.attr('class');
				if (classes.search('clickable') != -1) {
					this.$el.css('cursor', 'pointer');
				}
			},

			action: function() {
				console.log("Clicked on " + this.$el.attr('id'));
				var action = this.$el.attr('id');
				switch(action) {
					case 'start': {
						app_router.navigate('#/menu/menu');
						break;
					}
					case 'weekly': {
						app_router.navigate('#/summary/weeks');
						appModel.set('action_taken', true);
						break;
					}
					case 'monthly': {
						app_router.navigate('#/summary/months');
						appModel.set('action_taken', true);
						break;
					}
					case 'yearly': {
						app_router.navigate('#/summary/years');
						appModel.set('action_taken', true);
						break;
					}
					default: {
						app_router.navigate('#/' + action);
						appModel.set('action_taken', true);
					}			
				}
			}
		});

	return MenuNode;
});