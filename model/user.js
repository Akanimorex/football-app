const _ = require("underscore");
const bcrypt = require("bcrypt");
const cryptojs = require("crypto-js");
const jwt = require("jsonwebtoken");

module.exports = function (sequelize, DataType) {
	let user = sequelize.define('user', {
		email: {
			type: DataType.STRING,
			allowNull: false,
			validtion: {
				isEmail: true
			}
		},
		firstName: {
			type: DataType.STRING,
			allowNull: false,
			validtion: {
				len: [3, 30]
			}
		},
		lastName: {
			type: DataType.STRING,
			allowNull: false,
			validtion: {
				len: [3, 30]
			}
		},
		password: {
			type: DataType.VIRTUAL,
			allowNull: false,
			validtion: {
				len: [6, 30]
			},
			set: function(value){
				const salt = bcrypt.genSaltSync(10);
				const hashed = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('hash', hashed);
			}
		},
		salt: {
			type: DataType.STRING,
			allowNull: false
		},
		hash: {
			type: DataType.STRING,
			allowNull: false
		}
	},
	{
		hooks: {
			beforeValidate: function(user, option){
				if(user.email && typeof user.email == "string"){
					user.email = user.email.toLowerCase().trim();
				}
				if(user.username && typeof user.username == "string"){
					user.username = user.username.toLowerCase().trim();
				}
			}
		}
	});

		// instance methods
	user.prototype.toPublicJSON = function() {
		let values = this.toJSON();
		return _.omit(values, "salt", "hash", "updatedAt", "createdAt", "password");
	};

	user.prototype.generateToken = function(type){
		// type refers to the type of token to be generated
		if (!_.isString(type)) {
			return undefined;
		}

		try{
			let stringData = JSON.stringify({
				id: this.get('id'),
				type: type
			});
			let encrytedData = cryptojs.AES.encrypt(stringData, process.env.APP_ENC_KEY).toString();
			return jwt.sign({token: encrytedData}, process.env.TOKEN_ENC_KEY);
		}catch(e) {
			return undefined;
		}
	}

	// class methods
	user.authenticate = function(body){
		return new Promise(function(resolve, reject){
			user.findOne({
				where: {
					email: body.email.toLowerCase().trim()
				}
			}).then(function(user) {
				if (!user || !bcrypt.compareSync(body.password, user.get('hash'))) {
					return reject();
				}
				resolve(user);
			}, function() {
				reject();
			});
		});
	}

	user.findByToken = function(token){
		return new Promise(function(resolve, reject){
			try{
				let decodedData = jwt.verify(token, process.env.TOKEN_ENC_KEY);
				let decryptedData = cryptojs.AES.decrypt(decodedData.token, process.env.APP_ENC_KEY).toString(cryptojs.enc.Utf8);
				let key = JSON.parse(decryptedData);

				user.findByPk(key.id).then(function(user){
					if (!user) return reject();
					resolve(user);
				}, function(){
					reject();
				});
			}catch(e){
				reject()
			}
		});
	}

	return user;
}