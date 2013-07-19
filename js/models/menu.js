var app = app || {};

var Menu = Backbone.Model.extend({});

app.Menu = new Menu();

app.Menu.fetch({
	url: 'assets/json/menu.json',
	success: function() {
		console.log('Successfully loaded menu.json.');
	},
	error: function() {
		console.log('There was an error loading menu.json.');
	}
});