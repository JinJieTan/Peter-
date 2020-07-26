// server/index.js
import express from 'express';
import { render } from '../utils';
import { serverStore } from '../containers/redux-file/store';
const app = express();
app.use(express.static('public'));
app.get('*', function(req, res) {
  if (req.path === '/favicon.ico') {
    res.send();
    return;
  }
  const store = serverStore();
  res.send(render(req, store));
});
const server = app.listen(3000, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log(host, port);
  console.log('启动连接了');
});
