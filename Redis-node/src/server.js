const ProtoBufJs = require('protobufjs');
const { createServer } = require('net');
const fs = require('fs');
const root = ProtoBufJs.loadSync('./proto/message.proto');
const PingPong = root.lookupType('message.PingPong');
const Common = root.lookupType('message.Common');
const setSucceed = root.lookupType('message.setSucceed');
const getSucceed = root.lookupType('message.getSucceed');
const Data = root.lookupType('message.Data');
const Query = root.lookupType('message.Query');
const listenPort = 6380; //监听端口
const M = new Map();
M.set('1', 'Peter酱牛逼');
const server = createServer(function (socket) {
  socket.setKeepAlive(true);
  // 创建socket服务端
  //接收到数据
  socket.on('data', function (data) {
    //pb如果定义少字段了 跟graphql里面的schema 一样，就会导致数据字段丢失（类似mongdb的映射）
    const res = Common.decode(data);
    if (res.messageType === '1') {
      const payload = { messageType: '1', pong: '1' };
      const errMsg = PingPong.verify(payload);
      if (errMsg) throw Error(errMsg);
      const message = PingPong.create(payload);
      const buffer = PingPong.encode(message).finish();
      socket.write(buffer);
    } else if (res.messageType === '2') {
      const message = Data.decode(data);
      const payload = message.data;
      M.set(payload.key, payload.value);
      fs.appendFile(
        './redis.db',
        `${payload.key}-${payload.value}\u200b`, //编辑器、反爬虫、文字加密
        (error) => {
          if (error) return console.log('追加文件失败' + error.message);
          console.log('追加成功');
        }
      );
      const msg = { messageType: '5', uuid: message.uuid }; //应用层ACK机制   做一个消息抵达的确保回复
      const errMsg = setSucceed.verify(msg);
      if (errMsg) throw Error(errMsg);
      const m = setSucceed.create(msg);
      const buffer = setSucceed.encode(m).finish();
      socket.write(buffer);
    } else if (res.messageType === '3') {
      const message = Query.decode(data);
      const res = M.get(message.key);
      console.log(res, 'res');
    } else if (res.messageType === '6') {
      const message = Query.decode(data);
      const res = M.get(message.key);
      const msg = { messageType: '6', uuid: message.uuid, data: res };
      const errMsg = getSucceed.verify(msg);
      if (errMsg) throw Error(errMsg);
      const m = getSucceed.create(msg);
      const buffer = getSucceed.encode(m).finish();
      socket.write(buffer);
    }
  });
  //数据错误事件
  socket.on('error', function (exception) {
    console.log('socket error:' + exception);
    socket.end();
  });
  //客户端关闭事件
  socket.on('close', function (data) {
    console.log('client closed!');
  });
}).listen(listenPort);

//服务器监听事件
server.on('listening', function () {
  fs.readFile('./redis.db', (err, data) => {
    const string = data.toString();
    if (string.length > 0) {
      const result = string.split('\u200b');
      for (let i = 0; i < result.length; i++) {
        const res = result[i];
        for (let j = 0; j < res.length; j++) {
          if (res[j] === '-') {
            continue;
          }
          j === 0 ? M.set(res[j], null) : M.set(res[j - 2], res[j]);
        }
      }
    }
  });
  console.log('server listening:' + server.address().port);
});

//服务器错误事件
server.on('error', function (exception) {
  console.log('server error:' + exception);
});
