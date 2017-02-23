# Electron Wechat Client

A combination of:

+ [Electron](https://github.com/electron/electron)
+ [wechat4u](https://github.com/nodeWechat/wechat4u)
+ [antd](https://github.com/ant-design/ant-design)

This project contains a Typescript fork of [wechat4u](https://github.com/nodeWechat/wechat4u).

# How to start

```bash
$ npm install
```

To develop:

You need 3 terminals or tabs

```bash
# First tab: build the web app
$ npm run dev

# Second tab: build the electron app
$ npm run dev-electron
# or
$ webpack --config webpack-electron.config.js

# third tab: run the electron app
$ npm run app
```
