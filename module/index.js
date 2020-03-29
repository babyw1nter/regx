'use strict'
const api = require('./api.js')
const check = require('./check.js')

var config = require('../config/config.json')

exports.permission = (req, res) => {
  if (check.ipCheck(api.getReqIp(req))) {
    // 判断IP是否禁止访问
    if (config.system.reg.ip.mode == 'blacklist') {
      return false
    }
  } else {
    if (config.system.reg.mode == 'whitelist') {
      return false
    }
  }
  return true
}
