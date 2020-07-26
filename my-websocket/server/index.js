const MyWebSocket = require('./ws');
const ws = new MyWebSocket({ port: 8080 });

ws.on('data', (data) => {
  console.log('receive data:' + data);
  ws.send('this message from server');
});

ws.on('close', (code, reason) => {
  console.log('close:', code, reason);
});
