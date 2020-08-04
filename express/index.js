const express = require("./express");
const app = new express();

app.get("/test", (req, res, next) => {
  console.log("会所技师到位*1");
  //   res.end("会所技师开始服务1");
  next();
});

app.get("/test", (req, res, next) => {
  console.log("会所技师到位*2");
  res.end("会所技师开始服务2");
});

app.listen(8888, (err) => {
  !err && console.log("会所里面有大保健吗?");
});
