var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var passport = require("passport");
var session = require("express-session");
var flash = require("connect-flash");
var setUpPassport = require("./setuppassport");
var mongoStore = require("connect-mongo")(session);

var routes = require("./routes");

var app = express();

mongoose.connect('mongodb+srv://ryank:BiggieSmalls_20@cluster0.wqmk3.mongodb.net/pizza?retryWrites=true&w=majority');

setUpPassport();

app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
	secret:  "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
	resave: true,
	saveUninitialized: true,
	store: new mongoStore({mongooseConnection: mongoose.connection}),
	cookie: {maxAge: 180 * 60 * 1000}
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

app.use(function(req, res, next){
	res.locals.login = req.isAuthenticated();
	res.locals.session = req.session;
	next();
});

app.use(routes);



app.listen(app.get("port"), function(){
	console.log("Server started on port " + app.get("port"));
});
