var app = app || {};

app.AppView = Backbone.View.extend({

	el: '#panky',

	initialize: function() {
		this.$main = this.$('#main');
		this.$welcome = this.$('#welcome');
		this.$menu = this.$('#menu');

		this.listenTo(app.Menu, 'change:graph', this.render);
	},

	render: function() {
		this.$menu.html("<h2>Menu will go here!</h2>");
	}
});