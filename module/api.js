"use strict";
const crypto = require("crypto");
var config = require("../config/config.json");

exports.getReqIp = (req) => {
    let ip = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
	if(ip.split(",").length > 0){
		ip = ip.split(",")[0];
	}
	return ip;
};

exports.getRandomNum = (min, max) => {
	let range = max - min;   
	let rand = Math.random();
	return (min + Math.round(rand * range));
};

exports.getRandomStr = (len, ci = false) => {
	let strArr = new Array();
	strArr = ["a", "b", "c", "d", "e", "f", "A", "B", "C", "D", "E", "F", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	strArr.sort(() => { return 0.5 - Math.random() });
	let str = "";
	for (var i = 0; i < len; i++) {
		str += strArr[this.getRandomNum(0, strArr.length - 1)];
	}
	str = str.split("").sort(() => { return 0.5 - Math.random() }).join("");
	if(!ci) return str.toLowerCase();
	return str;
}

exports.getTimeStamp = () => {
	return new Date().getTime();
};

exports.timestamp2Date = (timestamp) => {
	let Date_ = new Date(timestamp);
	let Y = Date_.getFullYear();
	let M = Date_.getMonth() + 1;
		M = M < 10 ? '0' + M : M;// 不够两位补充0
	let D = Date_.getDate();
		D = D < 10 ? '0' + D : D;
	let H = Date_.getHours();
		H = H < 10 ? '0' + H : H;
	let Mi = Date_.getMinutes();
		Mi = Mi < 10 ? '0' + Mi : Mi;
	let S = Date_.getSeconds();
		S = S < 10 ? '0' + S : S;
	return Y + '-' + M + '-' + D + ' ' + H + ':' + Mi + ':' + S;
};

exports.encrypt = (str, ea) => {
	let encrypt_ = new encrypt(8);
	switch (ea) {
		case "MD5":
			return encrypt_.MD5(str);
			break;
		case "MD5VB":
			return encrypt_.MD5VB(str);
			break;
		case "SALTED2MD5":
			return encrypt_.SALTED2MD5(str);
			break;
		case "SALTEDSHA512":
			return encrypt_.SALTEDSHA512(str);
			break;
		case "SHA256":
			return encrypt_.SHA256(str);
			break;
		case "BASE64EN":
			break;
		case "BASE64DE":
			break;
		default:
			return str;
			break;
	}
};

class encrypt {
	constructor(saltlen){
		this.saltlen = saltlen * 2;
	}
	MD5(str){
		return crypto.createHash("md5").update(str).digest("hex");
	}
	MD5VB(str){
		// TUDO
	}
	SALTED2MD5(str){
		let salt = exports.getRandomStr(this.saltlen);
		return "$SALTED2MD5$" + salt + "$" + crypto.createHash("md5").update(crypto.createHash("md5").update(str).digest("hex") + salt).digest("hex");
	}
	SALTEDSHA512(str){
		// TUDO
	}
	SHA256(str){
		let salt = exports.getRandomStr(this.saltlen);
		return "$SHA$" + salt + "$" + crypto.createHash("sha256").update(crypto.createHash("sha256").update(str).digest("hex") + salt).digest("hex");
	}
};