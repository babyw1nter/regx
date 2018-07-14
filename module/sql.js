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
	connectTimeout: 5000,
	dateStrings: true  // date转字符串
});

exports.tableExist = async (tablename) => { // 查询表是否存在
	let status = false;
	let sql = "SHOW TABLES LIKE '" + tablename + "';";
	let query_table = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_table.then((onFulfilled, onRejected) => {
		if(onFulfilled.length !== 0){
			status = true;
		}
	});
	return status;
}

exports.createTable = async (tablename, sql) => { // 建表
	let status = false;
	let create_table = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await create_table.then((onFulfilled, onRejected) => {
		if(onFulfilled.length !== 0){
			status = true;
		}
	});
	return status;
};

exports.queryExist = async (key, val) => { // 查询是否已存在
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

exports.queryUsernameAndEmail = async (JSONdata) => { // 这里用户名和邮箱要两个表都查，回调地狱写法太深了，用了 async/await Promise 重构
	let username = JSONdata.id,
		email = JSONdata.e;
	let status = [false, false, false, false];
	let username_status = await this.queryExist("username", username),
		email_status = await this.queryExist("email", email);
	if(username_status && email_status){
		return true;
	}
	return false;
};

exports.queryTime = async (ip, time_count) => { // 查询同ip注册时间
	let nowTime = parseInt(api.getTimeStamp() / 1000) * 1000, // 精确到秒就可以了
		sqlTime_users = new Number(),
		sqlTime_authme = new Number(),
		countTime = time_count * 60 * 1000;
	let status = [false, false];
	let sql_ip_users = "SELECT `" + config.mysql.users.column.mySQLColumnId + "`, `" + config.mysql.users.column.mySQLColumnRegisterDate + "`, `" + config.mysql.users.column.mySQLColumnRegisterIp + "` FROM `" + config.mysql.users.tablename + "` WHERE `" + config.mysql.users.column.mySQLColumnRegisterIp + "` = '" + ip + "' ORDER BY `" + config.mysql.users.column.mySQLColumnId + "` DESC LIMIT 1;",
		sql_ip_authme = "SELECT `" + config.mysql.authme.column.mySQLColumnId + "`, `" + config.mysql.authme.column.mySQLColumnRegisterDate + "`, `" + config.mysql.authme.column.mySQLColumnRegisterIp + "` FROM `" + config.mysql.authme.tablename + "` WHERE `" + config.mysql.authme.column.mySQLColumnRegisterIp + "` = '" + ip + "' ORDER BY `" + config.mysql.authme.column.mySQLColumnId + "` DESC LIMIT 1;";
	let query_ip_users = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql_ip_users, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_ip_users.then((onFulfilled, onRejected) => {
		if(onFulfilled.length !== 0){
			let data = JSON.parse(JSON.stringify(onFulfilled))[0];
			sqlTime_users = api.getTimeStamp(data[config.mysql.users.column.mySQLColumnRegisterDate]);
		} else {
			status[0] = true;
		}
	});
	let query_ip_authme = new Promise((resolve, reject) => {
		mysql_pool.getConnection((error, connection) => {
			if (error) throw error;
			connection.query(sql_ip_authme, (err, res) => {
				if(err){
					reject(err);
				} else {
					resolve(res);
				}
				connection.release();
			});
		});
	});
	await query_ip_authme.then((onFulfilled, onRejected) => {
		if(onFulfilled.length !== 0){
			let data = JSON.parse(JSON.stringify(onFulfilled))[0];
			sqlTime_authme = parseInt(data[config.mysql.authme.column.mySQLColumnRegisterDate] / 1000) * 1000;
		} else {
			status[1] = true;
		}
	});
	if(status.indexOf(false) == -1){
		return true;
	}
	if((sqlTime_users + countTime) >= nowTime || (sqlTime_authme + countTime) >= nowTime){
		return false;
	} else {
		return true;
	}
	return false;
};

exports.insertReg = async (JSONdata, ip) => { // 插入数据表
	let status = [false, false];
	let username = JSONdata.id.toLowerCase(),
		realname = JSONdata.id,
		password = JSONdata.pwd,
		password_users = api.encrypt(password, config.mysql.users.saltlen, config.mysql.users.encrypt),
		password_authme = api.encrypt(password, config.mysql.authme.saltlen, config.mysql.authme.encrypt),
		email = JSONdata.e,
		date_timestamp = api.getTimeStamp(),
		date = api.timestamp2Date(date_timestamp);
	let sql_users = "INSERT INTO `" + config.mysql.users.tablename + "` (`" + config.mysql.users.column.mySQLColumnId + "`, `" + config.mysql.users.column.mySQLColumnName + "`, `" + config.mysql.users.column.mySQLRealName + "`, `" + config.mysql.users.column.mySQLColumnPassword + "`, `" + config.mysql.users.column.mySQLColumnEmail + "`, `" + config.mysql.users.column.mySQLColumnInviteCode + "`, `" + config.mysql.users.column.mySQLColumnRegisterDate + "`, `" + config.mysql.users.column.mySQLColumnRegisterIp + "`) VALUES (NULL, '" + username + "', '" + realname + "', '" + password_users + "', '" + email + "', NULL, '" + date + "', '" + ip + "')";
	let sql_authme = "INSERT INTO `" + config.mysql.authme.tablename + "` (`" + config.mysql.authme.column.mySQLColumnId + "`, `" + config.mysql.authme.column.mySQLColumnName + "`, `" + config.mysql.authme.column.mySQLRealName + "`, `" + config.mysql.authme.column.mySQLColumnPassword + "`, `" + config.mysql.authme.column.mySQLColumnIp + "`, `" + config.mysql.authme.column.mySQLColumnLastLogin + "`, `" + config.mysql.authme.column.mySQLlastlocX + "`, `" + config.mysql.authme.column.mySQLlastlocY + "`, `" + config.mysql.authme.column.mySQLlastlocZ + "`, `" + config.mysql.authme.column.mySQLlastlocWorld + "`, `" + config.mysql.authme.column.mySQLColumnRegisterDate + "`, `" + config.mysql.authme.column.mySQLColumnRegisterIp + "`, `" + config.mysql.authme.column.mySQLlastlocYaw + "`, `" + config.mysql.authme.column.mySQLlastlocPitch + "`, `" + config.mysql.authme.column.mySQLColumnEmail + "`, `" + config.mysql.authme.column.mySQLColumnLogged + "`, `" + config.mysql.authme.column.mySQLColumnHasSession + "`) VALUES (NULL, '" + username + "', '" + realname + "', '" + password_authme + "', NULL, NULL, '0', '0', '0', '" + config.mysql.authme.world + "', '" + date_timestamp + "', '" + ip + "', NULL, NULL, '" + email + "', '0', '0')";
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
		if(onFulfilled.length !== 0){
			status[1] = true;
		} else {
			status[1] = false;
		}
	});
	if(status.indexOf(false) == -1){
		return true;
	}
	return false;
}
