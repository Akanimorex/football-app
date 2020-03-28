require('dotenv').config();
const http = require('http');
const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const db = require('./db');
const cookieParser = require("cookie-parser");

function authentication(req, res, next){
	db.user.findByToken(req.cookies.auth).then(function(user){
		if (!user) return res.status(401).send();
		req.user = user;
		next();
	},	function(e){
		res.status(401).redirect('/');
	});
}

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());




app.get('/', (req, res)=>{
	res.sendFile(`${__dirname}/public/index.html`);
});

app.get('/login', (req, res)=>{
	res.sendFile(`${__dirname}/public/login.html`);
});

app.get('/register', (req, res)=>{
	res.sendFile(`${__dirname}/public/register.html`);
});

app.get('/quiz', authentication, (req, res)=>{
	res.sendFile(`${__dirname}/public/quiz.html`);
});

app.get('/sign-out', (req, res)=>{
	res.clearCookie('auth').redirect('/');
});

app.get('/tactics', (req, res)=>{
	res.sendFile(`${__dirname}/public/tactics.html`);
});

app.get('/tactic-style', authentication, (req, res)=>{
	res.sendFile(`${__dirname}/public/tactic-style.html`);
});

app.post('/sign-up', (req, res)=>{
	db.user.create(req.body).then(function(user){
		res.cookie("auth", user.generateToken("Authentication"));
		res.redirect('/quiz');
	}, function() {
		res.status(500).redirect("/register");
	});
});

app.post('/sign-in', (req, res)=>{
	db.user.authenticate(req.body).then(function(user){
		res.cookie("auth", user.generateToken("Authentication"));
		res.redirect('/quiz');
	}, function(e){
		res.status(401).redirect('/login');
	});
});

// Handle 500
app.use(function(error, req, res, next) {
  res.status(500).send(`${error}500: Internal Server Error`);
});

// Handle 404
app.use(function(req, res) {
  res.status(404).send('404: Page not Found');
});

// 
db.sequelize.sync({force: true}).then(function () {
	http.createServer(app).listen(PORT, ()=>{
		console.log(`server runnning on port ${PORT}`);
	});
}).catch(function(e){
	console.error('Error occured while synchronizing to DB', e);
});

// closing DB connection server down
process.on('exit', ()=>{
	console.log('exit: server shutdown...');
	db.sequelize.close();
	process.exit(2);
});
process.on('SIGINT', ()=>{
	console.log('Crtl+C: server shutdown...');
	db.sequelize.close();
	process.exit(2);
});
process.on('uncaughtException', ()=>{
	console.log('uncaughtException:', e);
	db.sequelize.close();
	process.exit(99);
});
