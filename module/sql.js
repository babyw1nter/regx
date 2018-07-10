"use strict";
const mysql_ = require("mysql");
const promise = require("promise");
const api = require("./api.js");
var config = require("../config/config.json");

var mysql_pool = mysql_.createPool({
	host: config.mysql.host,
	port: config.mysql.port,
	user: config.mysql.user,
	password: config.mysql.password,
	database: config.mysql.dbname,
	connectTimeout: 5000
});

var res = [];

exports.connect = () => {
	//TUDO...
}

exports.tableExistThenCreateTable = async (tablename) => {
	mysql_pool.getConnection((err, connection) => {
		let sql = "SELECT * FROM `" + tablename + "`";
		connection.query(sql, async (err, result) => {
			if(err){
				console.log("检测到数据表不存在, 正在创建中...");
				let ct = await this.createTable(tablename);
				if(ct) console.log("数据表创建完成!");
			}
		});
	});
}

exports.createTable = async (tablename) => { // 建表，TUDO...
	let sql_users = "CREATE TABLE `" + tablename + "` (`id` mediumint(8) unsigned NOT NULL, `username` varchar(255) NOT NULL, `realname` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `invite_code` varchar(255) DEFAULT NULL, `date` datetime NOT NULL, `ip` varchar(255) DEFAULT NULL, PRIMARY KEY (`id`), KEY `username` (`username`)) ENGINE=InnoDB DEFAULT CHARSET=utf8";
	let sql_authme = "CREATE TABLE `" + tablename + "` (`id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT, `username` varchar(255) NOT NULL, `realname` varchar(255) NOT NULL, `password` varchar(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, `ip` varchar(40) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL, `lastlogin` bigint(20) DEFAULT NULL, `x` double NOT NULL DEFAULT '0', `y` double NOT NULL DEFAULT '0', `z` double NOT NULL DEFAULT '0', `world` varchar(255) NOT NULL DEFAULT 'world', `regdate` bigint(20) NOT NULL DEFAULT '0', `regip` varchar(40) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL, `yaw` float DEFAULT NULL, `pitch` float DEFAULT NULL, `email` varchar(255) DEFAULT NULL, `isLogged` smallint(6) NOT NULL DEFAULT '0', `hasSession` smallint(6) NOT NULL DEFAULT '0', PRIMARY KEY (`id`), UNIQUE KEY `username` (`username`)) ENGINE=InnoDB DEFAULT CHARSET=utf8";
	return true;
};

exports.queryExist = async (key, val) => { // 查询是否已存在
	/*
	mysql_pool.getConnection((err, connection) => {
		if (err) throw err;
		let errmod = "exist";
  		let sql1 = "SELECT * FROM `" + config.mysql.users.tablename + "` WHERE " + key + " = '" + val + "' LIMIT 1;",
  			sql2 = "SELECT * FROM `" + config.mysql.authme.tablename + "` WHERE " + key + " = '" + val + "' LIMIT 1;";
  		connection.query(sql1, (err, result) => { // 查users表 回调地狱写法
  			if (err) throw err;
  			let errmod = "exist";
  			if(result.length == 0 && err == null){
  				connection.query(sql2, (err_, result_) => { // 查authme表
  					if (err) throw err;
  					if(result_.length == 0 && err_ == null){
  						checkreturn.CheckStatus = "true";
  					}
  					callback(res, checkreturn, errmod);
  				});
  			} else {
  				callback(res, checkreturn, errmod);
  			}
  		});
  		connection.release();
	});
	*/
	let status = [false, false];
	let sql_users = "SELECT * FROM `" + config.mysql.users.tablename + "` WHERE " + key + " = '" + val + "' LIMIT 1;",
		sql_authme = "SELECT * FROM `" + config.mysql.authme.tablename + "` WHERE " + key + " = '" + val + "' LIMIT 1;";
	let query_users = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql_users, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_users.then((onFulfilled, onRejected) => {
		//console.log(onFulfilled, onRejected);
		if(onFulfilled.length == 0){
			status[0] = true;
		} else {
			status[0] = false;
		}
	});
	let query_authme = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql_authme, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_authme.then((onFulfilled, onRejected) => {
		//console.log(onFulfilled, onRejected);
		if(onFulfilled.length == 0){
			status[1] = true;
		} else {
			status[1] = false;
		}
	});
	if(status.indexOf(false) != -1){
		return false;
	}
	return true;
};

exports.queryReg = async (JSONdata) => { // 这里用户名和邮箱要两个表都查，回调地狱写法太深了，用了 async/await Promise 重构
	let username = JSONdata.id,
		email = JSONdata.e;
	let status = [false, false, false, false];
	let sql_username = "SELECT * FROM `" + config.mysql.users.tablename + "` WHERE username = '" + JSONdata.id + "' LIMIT 1;",
		sql_email = "SELECT * FROM `" + config.mysql.users.tablename + "` WHERE email = '" + JSONdata.e + "' LIMIT 1;",
		sql_username_authme = "SELECT * FROM `" + config.mysql.authme.tablename + "` WHERE username = '" + JSONdata.id + "' LIMIT 1;",
		sql_email_authme = "SELECT * FROM `" + config.mysql.authme.tablename + "` WHERE email = '" + JSONdata.e + "' LIMIT 1;";
	let query_un = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql_username, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_un.then((onFulfilled, onRejected) => {
		//console.log(onFulfilled, onRejected);
		if(onFulfilled.length == 0){
			status[0] = true;
		} else {
			status[0] = false;
		}
	});
	let query_em = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql_email, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_em.then((onFulfilled, onRejected) => {
		//console.log(onFulfilled, onRejected);
		if(onFulfilled.length == 0){
			status[1] = true;
		} else {
			status[1] = false;
		}
	});
	let query_un_ae = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql_username_authme, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_un_ae.then((onFulfilled, onRejected) => {
		//console.log(onFulfilled, onRejected);
		if(onFulfilled.length == 0){
			status[2] = true;
		} else {
			status[2] = false;
		}
	});
	let query_em_ae = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql_email_authme, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_em_ae.then((onFulfilled, onRejected) => {
		//console.log(onFulfilled, onRejected);
		if(onFulfilled.length == 0){
			status[3] = true;
		} else {
			status[3] = false;
		}
	});
	//console.log("query:",status);
	if(status.indexOf(false) != -1){
		return false;
	}
	return true;
};

exports.queryTime = async (ip, time_count) => {
	console.log("IP检测:", ip, time_count);
	return true;
};

exports.insertReg = async (JSONdata, ip) => { // 插入数据表
	let status = [false, false];
	let username = JSONdata.id.toLowerCase(),
		realname = JSONdata.id,
		password = JSONdata.pwd, password_users = api.encrypt(password, config.mysql.users.encrypt), password_authme = api.encrypt(password, config.mysql.authme.encrypt),
		email = JSONdata.e,
		date_timestamp = api.getTimeStamp(),
		date = api.timestamp2Date(date_timestamp);
	let sql_users = "INSERT INTO `" + config.mysql.users.tablename + "` (`id`, `username`, `realname`, `password`, `email`, `invite_code`, `date`, `ip`) VALUES (NULL, '" + username + "', '" + realname + "', '" + password_users + "', '" + email + "', NULL, '" + date + "', '" + ip + "')";
	let sql_authme = "INSERT INTO `" + config.mysql.authme.tablename + "` (`id`, `username`, `realname`, `password`, `ip`, `lastlogin`, `x`, `y`, `z`, `world`, `regdate`, `regip`, `yaw`, `pitch`, `email`, `isLogged`, `hasSession`) VALUES (NULL, '" + username + "', '" + realname + "', '" + password_authme + "', NULL, NULL, '0', '0', '0', 'world', '" + date_timestamp + "', '" + ip + "', NULL, NULL, '" + email + "', '0', '0')";
	let query_users = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql_users, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_users.then((onFulfilled, onRejected) => {
		//console.log(onFulfilled, onRejected);
		if(onFulfilled.length !== 0){
			status[0] = true;
		} else {
			status[0] = false;
		}
	});
	let query_authme = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql_authme, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_authme.then((onFulfilled, onRejected) => {
		//console.log(onFulfilled, onRejected);
		if(onFulfilled.length !== 0){
			status[1] = true;
		} else {
			status[1] = false;
		}
	});
	if(status.indexOf(false) != -1){
		return false;
	}
	return true;
}

