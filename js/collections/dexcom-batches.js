define(['underscore', 'backbone', 'models/dexcom-batch'],
	function(_, Backbone, DexcomBatch) {
		var DexcomBatches = Backbone.Collection.extend({
			model: DexcomBatch
		});

	return DexcomBatches;
});