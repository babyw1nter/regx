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

## 反向代理

### Apache 反向代理

正在书写...

### Nginx 反向代理 (推荐)

在 `nginx.conf` 添加以下代码

```
server {
    listen        80;
    server_name   www.yoursite.com;

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host  $http_host;
        proxy_set_header X-Nginx-Proxy true;
        proxy_set_header Connection "";
        proxy_pass http://127.0.0.1:1234;
        proxy_intercept_errors on;
    }
    error_page   404  /404.html;
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   html;
    }
}
```

`listen 80;` 为监听 80 端口(即 http 协议)，如果开启 SSL (即 https 协议)那么请修改为 `listen 443;` ，并添加相应的 SSL 配置代码，具体代码就不在此贴出，一般证书提供商都会有相应的配置代码

`server_name www.yoursite.com;` 为绑定域名，将其修改为您的域名

`proxy_pass http://127.0.0.1:1234;` 后面的 `:1234` 为端口号，可根据站点的配置修改

添加完成后，保存配置文件，然后重启 Nginx

以上面为例子的话，此时访问 __www.yoursite.com__ 即可显示注册页面

__注意:__ 推荐开启 SSL ，此项目支持全站 HTTPS

## 开源协议

项目使用 AGPL-3.0 协议开源

具体请查看 [https://github.com/sc0utz/regx/blob/regx-node/LICENSE](https://github.com/sc0utz/regx/blob/regx-node/LICENSE)
