const Sequelize = require('sequelize');
let sequelize;
const db = {};

// create connection
if(process.env.NODE_ENV != "development"){
	//connection to production env
	sequelize = new Sequelize(process.env.DATABASE_URL,{
		dialect: 'postgres',
		ssl: true
	});
}else{
	sequelize = new Sequelize(undefined, undefined, undefined, {
		dialect: 'sqlite',
		storage: __dirname + '/data/db.sqlite',
		logging: false
	});
}

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = sequelize.import(__dirname+'/model/user.js');

module.exports = db;
