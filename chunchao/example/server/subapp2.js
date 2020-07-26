const express = require('express');
const app = express();
const { resolve } = require('path');
//设置跨域访问
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', ' 3.2.1');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});
app.use(express.static(resolve(__dirname, '../subapp2')));

app.listen(8890, (err) => {
  !err && console.log('8890端口成功');
});
