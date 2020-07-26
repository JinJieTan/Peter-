const express = require('express');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, '../dist')));

app.listen(3000, err => {
  if (!err) {
    console.log('监听成功，端口号3000');
  } else {
    console.log(err);
  }
});
