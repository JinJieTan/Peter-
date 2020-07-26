const ProtoBufJs = require('protobufjs');
const uuid = require('node-uuid');
const { Socket } = require('net');
const root = ProtoBufJs.loadSync('./proto/message.proto');
const PingPong = root.lookupType('message.PingPong');
const setSucceed = root.lookupType('message.setSucceed');
const getSucceed = root.lookupType('message.getSucceed');
const Data = root.lookupType('message.Data');
const Query = root.lookupType('message.Query');
const { EventEmitter } = require('events');
const { setCbQueue, getCbQueue } = require('./messageQueue');
const TCPClient = new Socket();
TCPClient.setKeepAlive(true);

class Redis extends EventEmitter {
  constructor() {
    super();
    //心跳3次探测不到即断线
    this.count = 0;
    this.timer = null;
  }

  static connect = function (port, host) {
    TCPClient.connect(port, host, function () {
      this.timer = setInterval(() => {
        if (this.count > 3) {
          clearInterval(this.timer);
          TCPClient.end();
          throw Error('timeout');
        }
        this.count++;
        const payload = { messageType: '1', ping: '1' };
        const errMsg = PingPong.verify(payload);
        if (errMsg) throw Error(errMsg);
        const message = PingPong.create(payload);
        const buffer = PingPong.encode(message).finish();
        TCPClient.write(buffer);
      }, 3000);
    });
    TCPClient.on('data', function (data) {
      const decodedMessage = PingPong.decode(data);
      if (decodedMessage.messageType === '1') {
        this.count = 0;
      } else if (decodedMessage.messageType === '5') {
        const res = setSucceed.decode(data);
        const cb = setCbQueue.get(res.uuid);
        cb && cb(); //这样写有可能会挂掉
        setCbQueue.delete(res.uuid);
      } else if (decodedMessage.messageType === '6') {
        const res = getSucceed.decode(data);
        const cb = getCbQueue.get(res.uuid);
        cb && cb(res.data);
        getCbQueue.delete(res.uuid);//Map是强引用，需要delete
      }
      //得到服务端返回来的数据
    });
    TCPClient.on('error', function (error) {
      //错误出现之后关闭连接
      console.log('error:' + error);
      TCPClient.end();
    });
    TCPClient.on('close', function () {
      //正常关闭连接
      console.log('Connection closed');
    });
    return this;
  };

  static set = function (data, cb) {
    // v1 根据时间戳和随机数生成的uuid
    const creatuuid = uuid.v1();
    data.uuid = creatuuid;
    setCbQueue.set(creatuuid, cb);
    const errMsg = Data.verify(data);
    if (errMsg) throw Error(errMsg);
    const message = Data.create(data);
    const buffer = Data.encode(message).finish();
    TCPClient.write(buffer);
  };

  static get = function (key, cb) {
    // v1 根据时间戳和随机数生成的uuid
    const creatuuid = uuid.v1();
    getCbQueue.set(creatuuid, cb);
    const msg = { messageType: '6', key, uuid: creatuuid };
    const errMsg = Query.verify(msg);
    if (errMsg) throw Error(errMsg);
    const message = Query.create(msg);
    const buffer = Query.encode(message).finish();
    TCPClient.write(buffer);
  };
}

module.exports = Redis;
