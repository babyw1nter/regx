# regx-node ![node](https://img.shields.io/badge/node-%3E%3D6.14.3-blue.svg) ![mysql](https://img.shields.io/badge/MySQL-%3E%3D5.4-blue.svg) [![license](https://img.shields.io/badge/license-AGPL--3.0-brightgreen.svg)](https://github.com/sc0utz/regx/blob/regx-node/LICENSE)

使用 Node.js 驱动的全新 Minecraft 网页注册系统，当然，它一般用来配合 AuthMe-Reloaded 插件使用

目的是将原插件的指令注册抛弃，防止熊孩子无限假人刷注册进服捣乱，使用此系统后可以将原插件的注册功能关闭

此项目为 [Authme-reger](https://github.com/sc0utz/Authme-Reger) 的重写版，新版本重写了整个前端模板，同时使用 Node.js 重写了后端，修复了一些历史遗留问题

此版本使用 __Node.js__ 驱动，当然，它还有另外一个使用 __PHP__ 驱动的版本 [点击跳转](https://github.com/sc0utz/regx/tree/regx-php)

## 功能特性

* 实时检测用户输入的内容并提交后端验证

* 腾讯点击式防灌水验证码

* 发送邮件验证码验证邮箱

* 注册昵称白名单/黑名单

* 注册邮箱白名单/黑名单

* 注册IP归属地白名单/黑名单

* 相同IP间隔N分钟后才能注册

* 支持 Authme 插件常用的加密算法

## 如何启动

将项目 Clone 到本地，使用 cd 命令切换到项目根目录，执行命令 `npm install` 来安装项目的依赖包

用编辑器打开 `config/config.json` 并填写数据库等信息，您可以根据自己的需要来调整相应的配置项

执行命令 `npm run start` 启动服务端，您会在控制台看到一行提示 __"Server is running on host XXXX"__

如果您没有改动过默认配置，那么您现在访问 `127.0.0.1:1234` 就会出现页面了

## 配置文件

正在书写...

## API接口

正在书写...

## 开源协议

项目使用 AGPL-3.0 协议开源

具体请查看 [https://github.com/sc0utz/regx/blob/regx-node/LICENSE](https://github.com/sc0utz/regx/blob/regx-node/LICENSE)
