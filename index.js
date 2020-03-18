require('dotenv').config();
const http = require('http');
const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const db = require('./db');

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.get('/', (req, res)=>{
	res.sendFile(`/index.html`);
});

app.get('/login', (req, res)=>{
	console.log("Auth", req.get("Auth"), res.header());
	res.sendFile('/login.html');
});

app.get('/register', (req, res)=>{
	res.sendFile('/register.html');
});

app.get('/tactics', (req, res)=>{
	res.sendFile('/tactics.html');
});

app.get('/sign-out', (req, res)=>{
	res.send('logged out');
});

app.post('/sign-up', (req, res)=>{
	db.user.create(req.body).then(function(user){
		res.json(user.toPublicJSON());
	}, function() {
		res.status(500).send();
	});
});

app.post('/sign-in', (req, res)=>{
	db.user.authenticate(req.body).then(function(user){
		res.header("Auth", user.generateToken("Authentication")).json(user.toPublicJSON());
	}, function(e){
		res.status(401).send();
	});
});

// Handle 500
app.use(function(error, req, res, next) {
  res.status(500).send('500: Internal Server Error');
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
