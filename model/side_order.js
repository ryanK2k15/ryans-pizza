var mongoose = require("mongoose");
var sideOrderSchema = mongoose.Schema({
	name: String,
	price: Number
});

sideOrderSchema.methods.pizzaDetails = function(){
	return this.name && this.toppings && this.price;
};

let SideOrder = mongoose.model('Side Order', sideOrderSchema, 'side_orders');
module.exports = SideOrder;