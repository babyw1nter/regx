'use strict'
const index = require('./index.js')
const sql = require('./sql.js')
const api = require('./api.js')
const check = require('./check.js')

var config = require('../config/config.json')

exports.register = async (JSONdata, ip) => {
  // 注册处理主入口
  let msg = {
    mod: 'reg',
    status: 'false',
    msg: 'null',
    id: JSONdata.id,
    e: JSONdata.e,
    ecode: JSONdata.ecode,
  }
  let checkstatus = await check.regCheck(JSONdata, ip) // 正则×验证码×是否重复×间隔时间 四重验证
  if (checkstatus !== true) {
    msg.msg = checkstatus
    msg.status = 'false'
  } else {
    let regstatus = await sql.insertReg(JSONdata, ip) // 插入数据表
    if (regstatus) {
      // 插入成功
      msg.msg = 'OK'
      msg.status = 'true'
      console.log('新用户注册成功:', JSONdata.id, JSONdata.e, ip, api.timestamp2Date(api.getTimeStamp()))
    } else {
      // 插入失败
      msg.msg = config.errMsg.reg.error
      msg.status = 'false'
    }
  }
  return msg
}
