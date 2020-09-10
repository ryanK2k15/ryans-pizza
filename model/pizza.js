var mongoose = require("mongoose");
var pizzaSchema = mongoose.Schema({
	name: String,
	toppings: String,
	price: Number
});

pizzaSchema.methods.pizzaDetails = function(){
	return this.name && this.toppings && this.price;
};

let Pizza = mongoose.model('Pizza', pizzaSchema, 'popular_pizzas');
module.exports = Pizza;