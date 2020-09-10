var mongoose = require("mongoose");
var productSchema = mongoose.Schema({
	type: String,
	name: String,
	description: String,
	price: Number
});

let Product = mongoose.model('Product', productSchema, 'products');
module.exports = Product;