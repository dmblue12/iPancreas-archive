var app = app || {};

app.AppView = Backbone.View.extend({

	el: '#main',

	initialize: function() {
		this.$welcome = this.$('#welcome');
		this.$mod = this.$('#modular');

		this.listenTo(app.Menu, 'change:graph', this.render);
	},

	render: function() {
		this.$mod.html("<h2>Menu will go here!</h2>");
	}
});