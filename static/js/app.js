/*
 * @name: app.js
 * @author: hhui64
 * @description: Magic....
 * @version: 0.0.1
 */

'use strict'

var CheckStatus = []

const ajaxObj = new ajaxObj_(window.location.href)

const RegExString_ = [
  // 调用格式 RegExString_[输入类型][判断类型][详细规则]
  [
    [[/^[^\s]+$/], ['不能包含空格']],
    [[/^.{5,16}$/], ['长度为5-16个字符']],
    [[/^[a-zA-Z][a-zA-Z0-9_]*$/], ['必须以字母开头，只能输入数字、字母、下划线']],
  ],
  [
    [[/^[^\s]+$/], ['不能包含空格']],
    [[/^.{6,16}$/], ['长度为6-16个字符']],
    [[/^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[\(\)])+$)([^(0-9a-zA-Z)]|[\(\)]|[a-z]|[A-Z]|[0-9]){2,}$/], ['必须包含数字、字母、符号中至少2种']],
  ],
  [
    [[/^.{6,32}$/], ['长度为6-32个字符']],
    [[/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/], ['请输入正确的邮箱格式']],
  ],
  [
    [[/^[^\s]+$/], ['不能包含空格']],
    [[/^.{6}$/], ['长度为6个字符']],
  ],
]

function ajaxObj_(ajaxUrl) {
  this.url = ajaxUrl
  this.data = ''
  this.getRegExString = function () {}
  this.getCont = function (id, url) {
    id.load(url, this.data, function (response, status, xhr) {
      let r = {
        response: response,
        status: status,
        xhr: xhr,
      }
      return r
    })
  }
  this.ajaxCheck = function (InputName, InputVal, BizState) {
    let ajaxCheckReturn = {
      status: false,
      byAjax: true,
      error: 'null',
      inputname: InputName,
    }
    let formData = {
      InputName: InputName,
      InputVal: InputVal,
      BizState: BizState,
    }
    let JSONdata = JSON.stringify(formData)
    $.get(this.url + 'api/get', { mod: 'check', data: JSONdata }, function (data, textStatus, jqXHR) {
      // 膜法
      if (data.length == 0) {
        ajaxCheckReturn.inputname = data.InputName
        ajaxCheckReturn.error = '网络错误！'
        return ajaxCheckReturn
      }
      data = JSON.parse(data)
      if (data.CheckStatus == 'false' || data.CheckStatus == false) {
        ajaxCheckReturn.inputname = data.InputName
        ajaxCheckReturn.error = data.Message
      } else {
        ajaxCheckReturn.status = true
      }
      setInputStatus(ajaxCheckReturn)
    })
    return ajaxCheckReturn
  }
  this.ajaxSendecode = function (formData) {
    formData['timestamp'] = this.getTimeStamp(100)
    let JSONdata = JSON.stringify(formData)
    $.get(this.url + 'api/get', { mod: 'sendecode', data: JSONdata }, function (data, textStatus, jqXHR) {
      data = JSON.parse(data)
      console.log(data)
    })
  }
  this.ajaxReg = function (formData) {
    formData['timestamp'] = this.getTimeStamp(100)
    let JSONdata = JSON.stringify(formData)
    $.post(this.url + 'api/post', { mod: 'reg', data: JSONdata }, function (data, textStatus, jqXHR) {
      // ajax提交表单内容
      data = JSON.parse(data)
      if (data.status == 'true') {
        $('div.reg-res').addClass('reg-success')
        $('#reg-st-icon').find('i').addClass('mdi-check-circle')
        $('#reg-st-icon').find('i').removeClass('mdi-alert-circle')
        $('#reg-st').html('注册成功')
        $('#reg-id').find('span').html(data.id)
      } else {
        $('div.reg-res').addClass('reg-error')
        $('#reg-st-icon').find('i').removeClass('mdi-check-circle')
        $('#reg-st-icon').find('i').addClass('mdi-alert-circle')
        $('#reg-st').html('注册失败')
        $('#reg-tip').html(data.msg)
      }
      switchPage(1)
    })
  }
  this.base64 = function (val, timeStamp) {
    //return btoa
  }
  this.getTimeStamp = function (val) {
    return new Date().getTime()
  }
}

function Check(index, InputName, InputVal, BizState, isAjaxCheck = false) {
  // isAjaxCheck是用来控制正则通过后是否提交ajax检测的开关
  let CheckReturn = {
    status: false,
    byAjax: false,
    hasAjax: isAjaxCheck,
    all: [],
    error: 'null',
    inputname: InputName,
    index: index,
  }
  if (RegExString_.length < 1 || RegExString_.length < index + 1 || typeof InputName == 'undefined') {
    return CheckReturn
  }
  for (let i = 0; i < RegExString_[index].length; i++) {
    if (RegExString_[index][i][0][0].test(InputVal)) {
      CheckReturn.all.push('success')
    } else {
      CheckReturn.all.push('error')
    }
  }
  for (var i = 0; i < CheckReturn.all.length; i++) {
    if (CheckReturn.all[i] == 'error') {
      CheckReturn.status = false
      break
    } else {
      CheckReturn.status = true
    }
  }
  if (CheckReturn.status && isAjaxCheck) {
    // ajax检测
    ajaxObj.ajaxCheck(InputName, InputVal, BizState)
  }
  return CheckReturn
}

function checkAll(isFocus = false) {
  // 被动式检查所有状态
  let index = RegExString_.length
  let returnArray = []
  for (let i = 0; i < index; i++) {
    if (isFocus) {
      $('#reg-form')
        .children('div:eq(' + i + ')')
        .find('input')
        .blur()
    }
    let dataCheck = $('#reg-form')
      .children('div:eq(' + i + ')')
      .data('check')
    if (dataCheck) {
      returnArray.push('true')
    } else {
      returnArray.push('false')
    }
  }
  CheckStatus = returnArray
  return returnArray
}

function setInputStatus(CheckReturn) {
  if ($('#' + CheckReturn.inputname).is(':focus') || $('#' + CheckReturn.inputname).hasClass('has-input-button')) {
    return
  }
  if (!CheckReturn.status) {
    // 判断返回的状态码, 选取元素时尽量不用this, 而是用提交上去判断的name, 怕产生什么妖魔鬼怪的bug.
    $('#' + CheckReturn.inputname + '-error-tip').show()
    if (CheckReturn.error !== 'null') {
      // 判断是否有外部error
      $('#' + CheckReturn.inputname + '-error-tip')
        .find('span')
        .find('span')
        .html(CheckReturn.error)
    }
    $('input[name=' + CheckReturn.inputname + ']')
      .parent('div')
      .addClass('has-error')
    $('input[name=' + CheckReturn.inputname + ']')
      .parent('div')
      .data('check', false)
  } else {
    if (!CheckReturn.hasAjax || CheckReturn.byAjax) {
      $('input[name=' + CheckReturn.inputname + ']')
        .parent('div')
        .addClass('has-success')
      $('input[name=' + CheckReturn.inputname + ']')
        .parent('div')
        .data('check', true)
    }
  }
}

$('input').on('focus', function () {
  // input focus事件处理
  let InputName = $(this).attr('name')
  if (typeof InputName == 'undefined' || InputName == '') {
    return false
  }
  let index = $('#' + InputName + '-div').index()
  let CheckReturn = Check(index, InputName, $(this).val(), $('input[name=e]').val(), false) // 提交检测
  $('#' + InputName + '-div').removeClass('has-success')
  $('#' + InputName + '-div').removeClass('has-error')
  if ($('#' + InputName + '-div').data('button')) {
    $('#' + InputName + '-div').addClass('has-input-button')
  }
  $('#' + InputName + '-tip').html('')
  for (let i = 0; i < RegExString_[index].length; i++) {
    let itag = "<i class='mdi mdi-alert-circle'></i>",
      spantag_1 = '<span id=',
      spantag_2 = '-tt-',
      spantag_3 = '>',
      spantag_4 = '</span>'
    let tiptag = spantag_1 + InputName + spantag_2 + i + spantag_3 + itag + RegExString_[index][i][1] + spantag_4
    $('#' + InputName + '-tip').append(tiptag)
  }
  $('#' + InputName + '-tip').show()
  $('#' + InputName + '-error-tip').hide()
  $(this).keyup()
})

$('input').on('blur', function () {
  // input blur事件处理
  let InputName = $(this).attr('name')
  if (typeof InputName == 'undefined' || InputName == '') {
    return false
  }
  let index = $('#' + InputName + '-div').index()
  let goAjax = true
  if (InputName == 'pwd') {
    goAjax = false
  }
  let CheckReturn = Check(index, InputName, $(this).val(), $('input[name=e]').val(), goAjax) // 提交检测
  $('#' + InputName + '-div').removeClass('has-input-button')
  $('#' + InputName + '-tip').hide()
  for (var i = 0; i < CheckReturn.all.length; i++) {
    // 遍历检测集, 有错误的显示出来
    if (CheckReturn.all[i] == 'error') {
      let errStr = ''
      if ($(this).val().length <= 0) {
        let namep = $(this).attr('placeholder')
        errStr = namep + '不能为空'
      } else if (CheckReturn.error == 'null') {
        errStr = RegExString_[index][i][1][0]
      } else {
        errStr = ''
      }
      $('#' + InputName + '-error-tip')
        .find('span')
        .find('span')
        .html(errStr)
      break
    }
  }
  setInputStatus(CheckReturn)
  checkAll(false)
})

$('input').on('keyup', function () {
  // input change事件处理
  let InputName = $(this).attr('name')
  if (typeof InputName == 'undefined' || InputName == '') {
    return false
  }
  let index = $('#' + InputName + '-div').index()
  let CheckReturn = Check(index, InputName, $(this).val(), false) // 提交检测
  for (var i = 0; i < CheckReturn.all.length; i++) {
    if (CheckReturn.all[i] == 'success') {
      $('#' + InputName + '-tt-' + i)
        .find('i')
        .removeClass('i-error')
      $('#' + InputName + '-tt-' + i)
        .find('i')
        .removeClass('mdi-alert-circle')
      $('#' + InputName + '-tt-' + i)
        .find('i')
        .addClass('mdi-check-circle') // ok
      $('#' + InputName + '-tt-' + i)
        .find('i')
        .addClass('i-success')
    } else if (CheckReturn.all[i] == 'error') {
      $('#' + InputName + '-tt-' + i)
        .find('i')
        .removeClass('i-success')
      $('#' + InputName + '-tt-' + i)
        .find('i')
        .removeClass('mdi-check-circle') // ok
      $('#' + InputName + '-tt-' + i)
        .find('i')
        .addClass('mdi-alert-circle')
      $('#' + InputName + '-tt-' + i)
        .find('i')
        .addClass('i-error')
    } else {
      alert('Unknow Error!')
    }
  }
})

$('input[id=ag]').click(function () {
  // 用户协议复选框控制
  let isCheck = $(this).is(':checked')
  if (isCheck) {
    $('button[name=submit]').removeClass('disabled')
  } else {
    $('button[name=submit]').addClass('disabled')
  }
})

$('a[id^=cont-]').click(function () {
  // ajax获取内容
  let elementID = $(this).attr('id').substring(5)
  $('.content-window').html('')
  if ($('.content-window').html().trim().length <= 0) {
    ajaxObj.getCont($('.content-window'), 'cont/' + elementID + '.html')
  }
  $('.modal-title').html($(this).text())
})

function switchPage(page) {
  // 页面切换控制
  let pageCount = $('#rw').children('div[id^=rw-cb-]').length
  if (page > pageCount) {
    return
  }
  for (var i = 0; i < pageCount; i++) {
    $('#rw-cb-' + i).fadeOut(100)
  }
  setTimeout(function () {
    $('#rw-cb-' + page).fadeIn(100)
  }, 100)
}

var bgcount = 1
;(function switchBackground() {
  //背景图轮播, 可根据需要修改
  let bgurl = [
    'r.photo.store.qq.com/psb?/V145DJPI4LwgJ7/Q.F.w52N4KEkXz7cgw5sWmF8Pqj9jbM7BE*JntmxuRo!/r/dFUAAAAAAAAA',
    'r.photo.store.qq.com/psb?/V145DJPI4LwgJ7/LRbplIvBj3mm*HSzdsAYMimeW68jEHyqI8ozeNTIe3w!/r/dGEBAAAAAAAA',
    'r.photo.store.qq.com/psb?/V145DJPI4LwgJ7/igs12k0Us7KGZ*cuxgAz4PHXwMUopWzNgSyoe5cxS0A!/r/dFcAAAAAAAAA',
    'r.photo.store.qq.com/psb?/V145DJPI4LwgJ7/5Ijg4.KM2q4KZwLMqVIA5QOFJFlnYy39PtExvuzWMqQ!/r/dFoAAAAAAAAA',
    'r.photo.store.qq.com/psb?/V145DJPI4LwgJ7/sD0ymrpptW7NrXg8.nGAx3oUtU28Cat*aH89MoSRLIk!/r/dDEBAAAAAAAA',
  ]
  setTimeout(function () {
    $('#lb').css('background-image', 'url(https://' + bgurl[bgcount] + ')') // !注意: 若站点启用https,则此处不能修改,否则https标会提示"不安全"!!!
    bgcount++
    if (bgcount >= 5) {
      bgcount = 0
    }
    switchBackground()
  }, 7000)
})()

$('button[name=submit]').click(function () {
  // ajax提交注册表单
  if ($(this).hasClass('disabled')) {
    return false
  }
  checkAll(true)
  let cr = checkAll(false)
  if ($.inArray('false', cr) != -1) {
    return false
  } else {
    $(this).addClass('disabled')
    $(this).html('正在提交...')
  }
  setTimeout(function () {
    cr = checkAll(false)
    if ($.inArray('false', cr) != -1) {
      $('button[name=submit]').removeClass('disabled')
      $('button[name=submit]').html('立即注册')
      return false
    }
    verify_submit.show()
  }, 300)
})

$('a#sendecode').mousedown(function () {
  setTimeout(function () {
    // 延迟一下, 让它在blur事件之后再执行
    $('input[name=ecode]').focus()
  }, 1)
  checkAll(false)
  if (CheckStatus[2] == 'false' || typeof CheckStatus[3] == 'undefined') {
    return false
  }
  if ($(this).hasClass('disabled')) {
    return false
  }
  verify_sendecode.show()
})

function sendecode(sec, id) {
  $('input[name=ecode]').val('')
  id.data('sec', sec) // 倒计时
  ecodeCD(id)
}

function ecodeCD(id) {
  // 倒计时函数
  let sec = id.data('sec')
  sec--
  id.data('sec', sec)
  id.addClass('disabled')
  id.html('重新获取(' + sec + ')')
  let secer = setTimeout(function () {
    ecodeCD(id)
  }, 1000)
  if (sec <= 0) {
    clearTimeout(secer)
    id.removeClass('disabled')
    id.html('获取验证码')
  }
}

var appid_sendecode = $('a#sendecode').data('appid'), // 获取APPID
  appid_reg = $('button[name=submit]').data('appid')

if (!appid_sendecode || !appid_reg) {
  // 判断获取成功?
  alert('AppID Error')
}

var verify_sendecode = new TencentCaptcha(
  appid_sendecode.toString(),
  function (res) {
    // ajax发送邮箱验证码验证
    if (res.ret === 0) {
      $('input[name=ecode]').val(' ')
      $('input[name=ecode]').blur()
      $('input[name=ecode]').val('')
      $('input[name=ecode]').focus()
      let formData = {
        e: $('input[name=e]').val(),
        ticket: res.ticket,
        randstr: res.randstr,
        bizstate: res.bizState,
      }
      ajaxObj.ajaxSendecode(formData)
      sendecode(90, $('a#sendecode'))
    }
  },
  { bizState: 'sendecode' }
)

var verify_submit = new TencentCaptcha(
  appid_reg.toString(),
  function (res) {
    // ajax提交注册验证
    if (res.ret === 0) {
      let formData = {
        id: $('input[name=id]').val(),
        pwd: $('input[name=pwd]').val(),
        e: $('input[name=e]').val(),
        ecode: $('input[name=ecode]').val(),
        ticket: res.ticket,
        randstr: res.randstr,
        bizstate: res.bizState,
      }
      ajaxObj.ajaxReg(formData) // json
    }
  },
  { bizState: 'submit' }
)

$(window).resize(function () {
  // 左侧banner根据尺寸自动调整宽度 1000px 1200px
  let window_wh = {
    width: $(this).width(),
    height: $(this).height(),
  }
  let lb_wh = {
    width: $('#lb').width(),
    height: $('#lb').height(),
  }
  if (window_wh.width < 1200 && window_wh.width > 1000) {
    $('#lb').css('width', 240)
  } else if (window_wh.width <= 1000) {
    $('#lb').css('width', 0)
  } else if (window_wh.width >= 1200) {
    $('#lb').css('width', 480)
  }
  if (window_wh.width <= 1000) {
    $('#topnav-logo').fadeIn(300)
  } else {
    $('#topnav-logo').hide()
  }
  if (window_wh.width <= 540) {
    $('#top-nav').addClass('topnav-small')
  } else {
    $('#top-nav').removeClass('topnav-small')
  }
  $('#rw').css('width', window_wh.width - $('#lb').width())
})

$(document).ready(function () {
  $(window).resize()
})
