<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## 编辑文件

基于隐私问题需要创建如下文件  
.env 文件

```YAML
//.env
QINIU_ACCESS_KEY=七牛云access key
QINIU_SECRET_KEY=七牛云secret key
QINIU_SCOPE=应用名称
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_SERVICE=qq
EMAIL_AUTH_USER=qq 邮箱地址
EMAIL_AUTH_PASSWORD=QQ smtp认证密码
LIVE_PULL_URL=live-app.pull.xgpax.top
LIVE_PUSH_URL=live-app.push.xgpax.top
APP_NAME=live-app
LIVE_PUSH_KEY=腾讯云直播key
```

ormconfig.json 文件

```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "数据库用户",
  "password": "数据库密码",
  "database": "live_app",
  "entities": ["dist/**/*.entity{.ts,.js}"],
  "synchronize": true,
  "logging": true
}
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
