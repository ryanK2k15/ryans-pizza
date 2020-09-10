var express = require("express");
var User = require("./model/user");
var Pizza = require("./model/pizza");
var Cart = require("./model/cart");
var SideOrder = require("./model/side_order");
var Product = require("./model/product");
var Order = require("./model/order");
var passport = require("passport");
// var scripts = require("./checkout");
// var Stripe = require("./stripe");

var router = express.Router();

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.errors = req.flash("error");
	res.locals.infos = req.flash("info");
	next();
});

router.get("/", function(req, res, next){
	//var successMessage = req.flash('success')[0];
	//res.render('index', {successMessage: successMessage, noMessage: !successMessage});
	res.render('index');
	/* User.find().sort({ createdAt: "descending"}).exec(function(err, users){
		if(err){ return next(err);}
		res.render("index", {users:users});
	}); */
	
});

router.get("/pizzas", function(req, res){
	 Product.find({type: "pizza"}, (err, pizzas) => {

        if (err) { 
		console.error(err);
		return next(err);
		}
		//console.log(pizzas);
        res.render('pizzas', {pizzas})
    })
});

router.get("/side_order", function(req, res){
	 Product.find({type: "side_order"}, (err, sideOrders) => {

        if (err) { 
		console.error(err);
		return next(err);
		}
		console.log(sideOrders);
        res.render('side_order', {sideOrders})
    })
});

router.get("/drinks", function(req, res){
	 Product.find({type: "drink"}, (err, drinks) => {

        if (err) { 
		console.error(err);
		return next(err);
		}
		console.log(drinks);
        res.render('drinks', {drinks})
    })
});

router.get("/cart/:id", function(req, res, next){
	var productId = req.params.id;
	//console.log(productId);
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	console.log(productId);
	Product.findById(productId, function(err, item){
		if(err){
			return res.redirect("/index");
		}
		console.log(productId);
		cart.add(item, productId);
		req.session.cart = cart;
		console.log(req.session.cart);
		if(item.type === "pizza")
			res.redirect("/pizzas");
		if(item.type === "side_order")
			res.redirect("/side_order");
		if(item.type === "drink")
			res.redirect("/drinks");
	});
});

router.get("/remove/:id", function(req, res, next){
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	cart.removeOne(productId);
	req.session.cart = cart;
	res.redirect("/cart");
});

router.get("/removeAll/:id", function(req, res, next){
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	cart.removeAll(productId);
	req.session.cart = cart;
	console.log(req.session.cart);
	res.redirect("/cart");
});

router.get("/cart", function(req, res, next){
	if(!req.session.cart){
		return res.render("cart", {items:null});
	}
	var cart = new Cart(req.session.cart);
	res.render("cart", {items: cart.generateArray(), totalPrice: cart.totalPrice});
});
	
router.get("/checkout", ensureAuthenticated, function(req, res, next){
	if(!req.session.cart){
		return res.redirect("/cart");
	}
	var cart = new Cart(req.session.cart);
	var errorMessage = req.flash('error')[0];
	res.render("checkout", {total: cart.totalPrice, errorMessage: errorMessage, noError: !errorMessage});
});

router.post("/checkout", ensureAuthenticated, function(req, res, next){
	if(!req.session.cart){
		return res.redirect("/cart");
	}
	var cart = new Cart(req.session.cart);
	var stripe = require("stripe")("sk_test_51HEzR9GJaTt6vUcmmkI24ja9q0DYKCSOhV0CeysJ1qck5ig5Mt5oLPl9Bp3Z9L5lM8AmrGQXnhhhLK6QKahgvBZF00UUnG8g2p");
	
	stripe.charges.create({
		amount: cart.totalPrice * 100,
		currency: "eur",
		source: req.body.stripeToken, //obtained with Stripe.js
		description: "Test Charge"
	}, function(err, charge){
		//asynchronously called
		if(err){
			req.flash('error', err.message);
			return res.redirect("/checkout");
		}
		var order = new Order({
			user: req.user,
			cart: cart,
			address: req.body.address,
			name: req.body.name,
			paymentId: charge.id
		});
		//console.log(order);
		order.save(function(err, result){
			if(err){
				console.log("error saving order");
				res.redirect("/");
			}
			else{
				req.flash('success', "Order Successful!");
				res.redirect("/orderSuccess");			
			}
		});
		
	});
});

router.get("/orderSuccess", function(req, res, next){
	var successMessage = req.flash('success')[0];
	var cart = new Cart(req.session.cart);
	var totalPrice = cart.totalPrice;
	var items = cart.generateArray();
	req.session.cart = null;
	res.render("orderSuccess", {items: items, totalPrice: totalPrice, successMessage: successMessage, noMessage: !successMessage});

});

router.get("/signup", function(req, res){
	res.render("signup");
});


router.get("/about", function(req, res){
	res.render("about");
});

router.post("/signup", function(req, res, next){
	var username = req.body.username;
	var password = req.body.password;
	
	User.findOne({username: username}, function(err, user) {
		if(err){ return next(err) };
		if(user){
			req.flash("error", "User already exists");
			return res.redirect("/signup");
		}
		
		var newUser = new User({
			username: username,
			password: password
		});
		newUser.save(next);
	});
}, passport.authenticate("login", {
	failureRedirect: "/signup",
	failureFlash: true
}), function(req, res, next){
	if(req.session.oldUrl){
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	}
	else{
		res.redirect("/profile");
	}
});

router.get("/users/:username", function(req, res, next){
	User.findOne({ username: req.params.username }, function(err, user){
		if(err) { return next(err); }
		if(!user) { return next(404);}
		res.render("profile", {user: user});
	});
});

router.get("/login", function(req, res){
	res.render("login");
});

router.post("/login", passport.authenticate("login", {
	failureRedirect: "/login",
	failureFlash: true
}), function(req, res, next){
	if(req.session.oldUrl){
		console.log("old url", req.session.olUrl);
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	}
	else{
		res.redirect("/profile");
	}
});

router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});


function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.session.oldUrl = req.url;
	req.flash("info", "You must be logged in to see this page");
	res.redirect("/login");	
}

/* router.get("/edit", ensureAuthenticated, function(req, res){
	res.render("edit");
});

router.post("/edit", ensureAuthenticated, function(req, res){
	req.user.displayName = req.body.displayname;
	req.user.bio = req.body.bio;
	req.user.save(function(err){
		if(err){
			next(err);
			return;
		}
		req.flash("info", "Profile uodated!");
		res.redirect("/edit");
	});
}); */

router.get("/profile", ensureAuthenticated, function(req, res, next){
	Order.find({user: req.user}, function(err, orders){
		if(err){
			return res.write("Error!");
		}
		var cart;
		orders.forEach(function(order){
			cart = new Cart(order.cart);
			order.items = cart.generateArray();
		});
		res.render("profile", {user: req.user, orders: orders});
	});
});
router.use(function(request, response){
	response.status(404).render("404");
});

module.exports = router;
