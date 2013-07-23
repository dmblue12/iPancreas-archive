define(['jquery', 'underscore', 'backbone'],
	function($, _, Backbone) {
		var MenuNode = Backbone.View.extend({

			events: {
				'click': 'action'
			},

			initialize: function() {
				this.$el.css('cursor', 'pointer');
			},

			action: function() {
				console.log("Clicked on " + this.$el.attr('id'));
				var action = this.$el.attr('id');
				switch(action) {
					case 'exit': {
						if (confirm('Are you sure you want to quit?')) {
							Ti.App.exit();
						}
					}
					case 'start': {
						app_router.navigate('#/menu/menu', { trigger: false });
					}				
				}
			}
		});

	return MenuNode;
});