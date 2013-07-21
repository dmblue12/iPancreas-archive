var app = app || {};

app.LoadView = Backbone.View.extend({

	el: '#load-data',

	initialize: function() {

		require(["text!../../assets/templates/form.html"], function(html) {
			$('#main').html(html);
		});
	}

});