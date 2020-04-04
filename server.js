/*
 * @name: server.js
 * @author: hhui64
 * @description: gloab control module
 * @version: 0.0.1
 */
'use strict'
const express_ = require('express')
const express = express_()
const router = express_.Router()
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')
const bodyParser = require('body-parser')

var config = require('./config/config.json')

const index = require('./module/index.js')
const sql = require('./module/sql.js')
const check = require('./module/check.js')
const reg = require('./module/reg.js')
const api = require('./module/api.js')

;(async function() {
  // 启动时检测数据表是否存在
  let check____ = await check.tableCheck()
})()

express.set('views', path.join(__dirname, '/static/html'))
express.set('view engine', 'ejs')
express.use('/', router)
express.use('/', express_.static('static'))

express.use(bodyParser.urlencoded({ extended: false }))
express.use(bodyParser.json())

router.get('/', (req, res) => {
  // 渲染HTML页面
  if (!index.permission(req, res)) {
    res.sendStatus(403)
    return
  }
  res.type('html')
  res.render('index', {
    title: config.website.title,
    description: config.website.description,
    keywords: config.website.keywords,
    url: config.website.url,
    h1_title: config.website.h1_title,
    h4_title: config.website.h4_title,
    checkbox_ag: config.website.checkbox_ag,
    footer: config.website.footer,
    appid_sendecode: config.verify.sendecode.AppID,
    appid_reg: config.verify.reg.AppID,
    session_code: api.encrypt(api.getRandomNum(10000, 99999).toString(), 0, 'BASE64EN')
  })
})

router.get('/api/get', async (req, res) => {
  // 处理get请求
  if (!index.permission(req, res)) {
    res.sendStatus(403)
    return
  }
  if (!req.query.mod || !req.query.data) {
    // 非法请求返回403
    res.sendStatus(403)
    return
  }
  let mod = req.query.mod
  let JSONdata = JSON.parse(req.query.data)
  res.type('text')
  switch (mod) {
    case 'check': // 实时检查
      if (!JSONdata.InputName || !JSONdata.InputVal) {
        // 非法参数
        res.sendStatus(403)
        return
      }
      let inputcheck = await check.inputCheck(JSONdata, res)
      res.send(inputcheck) // ** 已重构
      break
    case 'sendecode': // 发送邮件验证码
      check.verifyCheck(
        config.verify.sendecode.AppID,
        config.verify.sendecode.AppSecretKey,
        JSONdata.ticket,
        JSONdata.randstr,
        api.getReqIp(req),
        res,
        async (err, verify_data) => {
          let rtn = {
            mod: 'sendecode',
            msg: '',
            email: JSONdata.e
          }
          if (verify_data.response.toString() === '1') {
            let sendcode_status = await check.sendecode(JSONdata, res)
            rtn.msg = 'OK'
          } else {
            rtn.msg = verify_data.err_msg
          }
          res.send(JSON.stringify(rtn))
        }
      )
      break
    default:
      res.sendStatus(403)
      break
  }
})

express.post('/api/post', async (req, res) => {
  // post请求处理
  if (!index.permission(req, res)) {
    res.sendStatus(403)
    return
  }
  if (!req.body.mod || !req.body.data) {
    // 非法请求返回403
    res.sendStatus(403)
    return
  }
  let mod = req.body.mod
  let JSONdata = JSON.parse(req.body.data)
  if (!JSONdata || !JSONdata.id || !JSONdata.pwd || !JSONdata.e || !JSONdata.ecode || !JSONdata.ticket) {
    // 非法参数
    res.sendStatus(403)
    return
  }
  switch (mod) {
    case 'reg': // 注册提交表单
      check.verifyCheck(
        config.verify.reg.AppID,
        config.verify.reg.AppSecretKey,
        JSONdata.ticket,
        JSONdata.randstr,
        api.getReqIp(req),
        res,
        async (err, verify_data) => {
          if (verify_data.response.toString() === '1') {
            let regmsg = await reg.register(JSONdata, api.getReqIp(req))
            res.send(JSON.stringify(regmsg))
          }
        }
      )
      break
    default:
      break
  }
})

var server = express.listen(config.server.port, () => {
  var host = server.address().address
  var port = server.address().port
})

console.log('*** Server is running on host: ' + server.address().address + ':' + server.address().port + ' ***')

// END
