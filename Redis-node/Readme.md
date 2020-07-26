#### 写在开头
* 想学习造轮子技术,可以看我之前的原创文章大集合: `https://mp.weixin.qq.com/s/RsvI5AFzbp3rm6sOlTmiYQ`
* 如果你想领取`3700G`免费学习资料、或者加入技术交流群（禁止发广告），可以文末+我微信,专注技术不闲聊

### 什么是protobuffer?
  * protocol buffer是Google的一种独立的数据交换格式，可运用于多种领域。
  * protocolbuffer(以下简称PB)是google 的一种数据交换的格式，它独立于语言，独立于平台。
  * google 提供了多种语言的实现：java、c#、c++、go 和 python，每一种实现都包含了相应语言的编译器以及库文件。由于它是一种二进制的格式，比使用 xml 进行数据交换快许多。
  * 可以把它用于分布式应用之间的数据通信或者异构环境下的数据交换。作为一种效率和兼容性都很优秀的二进制数据传输格式，可以用于诸如网络传输、配置文件、数据存储等诸多领域。
### 总结一下优点
* 简单说来 Protobuf 的主要优点就是：简洁，快。
* 为什么这么说呢？
* 因为Protocol Buffer 信息的表示非常紧凑，这意味着消息的体积减少，自然需要更少的资源。比如网络上传输的字节数更少，需要的 IO 更少等，从而提高性能。
* 对于一条消息，用 Protobuf 序列化后的字节序列为：
```
08 65 12 06 48 65 6C 6C 6F 77
```
* 而如果用 XML，则类似这样：
```
31 30 31 3C 2F 69 64 3E 3C 6E 61 6D 65 3E 68 65 
 6C 6C 6F 3C 2F 6E 61 6D 65 3E 3C 2F 68 65 6C 6C 
 6F 77 6F 72 6C 64 3E 
```
 
### 在Node.js中引入PB

```
yarn add protobufjs -D
mkdir proto 
cd proto 
vi message.proto

....
//message.proto文件
package message;
option optimize_for = LITE_RUNTIME;
message Account{
    required string accountName = 1;
    required string pwd = 2; 
}
message AccountList{
    required int32 index = 1;
    repeated Account list = 2;
}
```

### 开始使用PB协议
* 引入`protobufjs`
* 读取root对象
```
const ProtoBufJs = require("protobufjs");
const root = ProtoBufJs.loadSync("./proto/message.proto");
```
* 读取定义好的pb文件, 动态引入读取
```
const ProtoBufJs = require("protobufjs");
const root = ProtoBufJs.loadSync("./proto/message.proto");
const AccountList = root.lookupType("message.AccountList");
const Account = root.lookupType("message.Account");
const accountListObj = AccountList.create();
for (let i = 0; i < 5;i++) {
  const accountObj = Account.create();
  accountObj.accountName = "前端巅峰" + i;
  accountObj.pwd = "Peter酱要比技术胖还骚" + i;
  accountListObj.list.push(accountObj);
}
const buffer = AccountList.encode(accountListObj).finish();

console.log(buffer)
```
* 使用nodemon启动项目

![](https://static01.imgkr.com/temp/214e903c9bae41e48710e475ac196d0b.png)

* 打印出了Buffer,此时转化成string
```
const ProtoBufJs = require("protobufjs");
const root = ProtoBufJs.loadSync("./proto/message.proto");
const AccountList = root.lookupType("message.AccountList");
const Account = root.lookupType("message.Account");
const accountListObj = AccountList.create();
const accountObj = Account.create();
accountObj.accountName = "前端巅峰";
accountObj.pwd = "Peter酱要比技术胖还骚";
accountObj.test = "大保健越做身体越虚是为什么";
accountListObj.list.push(accountObj);
const buffer = AccountList.encode(accountListObj).finish();
console.log(buffer.toString());
```
* 打印得到

![](https://static01.imgkr.com/temp/bd845375b47644b5adc3bba6f525ef36.png)

* 那么请问,大宝剑越做身体越虚弱,是为什么？

### 引入socket通信,二进制更好的支持
* 使用原生net模块的`socket`通信,由于是实现`redis`,这里不使用`udp`通讯,而是基于可靠的`TCP`,先编写`redis`服务端代码

```
const net = require("net");
const listenPort = 6380; //监听端口
const server = net
  .createServer(function (socket) {
    // 创建socket服务端
    console.log("connect: " + socket.remoteAddress + ":" + socket.remotePort);
    socket.setKeepAlive(true);
    socket.setEncoding("utf-8");
    //接收到数据
    socket.on("data", function (data) {
      console.log("client send:" + data);
    });
    socket.write("Hello client!\r\n");
    //数据错误事件
    socket.on("error", function (exception) {
      socket.end();
    });
    //客户端关闭事件
    socket.on("close", function (data) {
    });
  })
  .listen(listenPort);
//服务器监听事件
server.on("listening", function () {
  console.log("server listening:" + server.address().port);
});
//服务器错误事件
server.on("error", function (exception) {
  console.log("server error:" + exception);
});

```
* `redis`默认端口`6379`,我们监听在`6380`端口,心跳保活,应用层做`keep-alive`,`socket.setKeepAlive(true)`，保持长链接

### 编写redis客户端
* 引入`Socket`通信
```
const { Socket } = require("net");
//其他引入pb文件的代码不变
```
* 引入`pb`文件的代码不变,客户端一份,服务端一份,双工通讯两边`pb`文件都要各自有一份
```
const port = 6380;
const host = "127.0.0.1";
const client = new Socket();
client.setKeepAlive(true);
client.setEncoding("utf-8");
//连接到服务端
client.connect(port, host, function () {
  client.write("hello server");
  //向端口写入数据到达服务端
});
client.on("data", function (data) {
  console.log("from server:" + data);
  //得到服务端返回来的数据
});
client.on("error", function (error) {
  //错误出现之后关闭连接
  console.log("error:" + error);
  client.destory();
});
client.on("close", function () {
  //正常关闭连接
  console.log("Connection closed");
});
```
* 通过`socket`链接`6380`端口服务器,建立长链接
#### 应用层心跳保活　& 重连
* 重新定义pb文件,PingPong
```
package message;
syntax = "proto3";

message PingPong {
    string message_type = 1; // 会变成 messageType
    string ping = 2; 
    string pong = 3; 
}
```
* 客户端编译pb文件，使用pb协议进行通讯与服务端
```
const root = ProtoBufJs.loadSync('./proto/message.proto');
const PingPong = root.lookupType('message.PingPong');
 setInterval(() => {
    const payload = { message_type: '1', ping: '1', pong: '2' };
    const errMsg = PingPong.verify(payload);
    if (errMsg) throw Error(errMsg);
    const message = PingPong.create(payload);
    const buffer = PingPong.encode(message).finish();
    client.write(buffer);
  }, 3000);
```
* 每隔3秒发送心跳包一次

#### 服务端接受心跳
* 引入pb
```
const root = ProtoBufJs.loadSync('./proto/message.proto');
const PingPong = root.lookupType('message.PingPong');
```
* 接受心跳包
```
const server = createServer(function (socket) {
  socket.setKeepAlive(true);
  // 创建socket服务端
  //接收到数据
  socket.on('data', function (data) {
    const decodedMessage = PingPong.decode(data);
    console.log(decodedMessage, 'decodedMessage');
  });
  socket.write('Hello client!\r\n');
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
```

* 此时已经能接收到PB协议传输的Buffer，并且解析了

![](https://static01.imgkr.com/temp/bb23d27be39f48a897b19172debb5be8.png)

* 心跳保持，客户端发送心跳
```
  timer = setInterval(() => {
    count++;
    const payload = { messageType: '1', ping: '1' };
    const errMsg = PingPong.verify(payload);
    if (errMsg) throw Error(errMsg);
    const message = PingPong.create(payload);
    const buffer = PingPong.encode(message).finish();
    client.write(buffer);
  }, 3000);
```

* 服务端返回心跳
```
 socket.on('data', function (data) {
    const decodedMessage = PingPong.decode(data);
    console.log(decodedMessage,'decodedMessage')
    if(decodedMessage.messageType ==='1'){
      console.log('进入判断')
      const payload = { messageType: '1', pong: '1'};
      const errMsg = PingPong.verify(payload);
      if (errMsg) throw Error(errMsg);
      const message = PingPong.create(payload);
      const buffer = PingPong.encode(message).finish();
      socket.write(buffer);
    }
  });
```
* 客户端记录心跳，做超时、断了的处理
```
client.on('data', function (data) {
  const decodedMessage = PingPong.decode(data);
  if (decodedMessage.messageType === '1') {
    console.log('收到心跳回包');
    count = 0;
  }
  console.log('from server:' + decodedMessage.messageType);
  //得到服务端返回来的数据
});
```
* 发送心跳时候判断，三次后收不到心跳，抛出错误，不再发送心跳
```
  timer = setInterval(() => {
    if (count > 3) {
      clearInterval(timer);
      client.end();
      throw Error('timeout')
    }
    count++;
    const payload = { messageType: '1', ping: '1' };
    const errMsg = PingPong.verify(payload);
    if (errMsg) throw Error(errMsg);
    const message = PingPong.create(payload);
    const buffer = PingPong.encode(message).finish();
    client.write(buffer);
  }, 3000);
```
* 服务端故意不回复心跳
```
  socket.write(buffer);
```
* 客户端抛出错误,取消心跳发送,断开`socket`链接

![](https://static01.imgkr.com/temp/8c9e87df30c54054a0325e6626870be9.png)

* 此时应该还有重连机制,这里就不做处理了，还有发送队列这些

#### 实现redis的get,set方法
* 数据存储,服务端用`Map`类型存储
* 传输使用`PB`协议
* 接受到消息回复`ACK`

#### 定义数据传输的`Payload` pb字段
* 定义字段
```
message Data {
    string message_type = 1; // 会变成 messageType
    Payload data = 2;
}


message Payload {
    required string key = 1;
    required string value =2;
}
```
* 此时定义RedisSet函数:
```
const Data = root.lookupType('message.Data');
function RedisSet() {
  const msg = { messageType: '2', data: { key: '1', value: '2' } };
  const errMsg = Data.verify(msg);
  if (errMsg) throw Error(errMsg);
  const message = Data.create(msg);
  const buffer = Data.encode(message).finish();
  client.write(buffer);
}
```
* 服务端decode解析反序列化
```
  socket.on('data', function (data) {
    const decodedMessage = PingPong.decode(data);
    console.log(decodedMessage,'decodedMessage');
    if(decodedMessage.messageType ==='1'){
      const payload = { messageType: '1', pong: '1'};
      const errMsg = PingPong.verify(payload);
      if (errMsg) throw Error(errMsg);
      const message = PingPong.create(payload);
      const buffer = PingPong.encode(message).finish();
      socket.write(buffer);
    }
  });
```
* 反序列化成功

![](https://static01.imgkr.com/temp/e3c372c934b34ac4bad3bf5d9f596f05.png)

* 此时已经拿到了数据,但是细心观察的会发现，我们拿错了反序列的对象去处理，导致数据有问题,那么我们需要告知收包方应该用什么对象去反序列化
* 此时最佳方案应该定义common字段去先反序列化一次

```
message Common {
    string message_type = 1; 
}
```

* 在服务端先反序列化一次，用`common`,得到messageType后再进行处理,再反序列化一次
```
  socket.on('data', function (data) {
    const res = Common.decode(data);
    if (res.messageType=== '1') {
      const payload = { messageType: '1', pong: '1' };
      const errMsg = PingPong.verify(payload);
      if (errMsg) throw Error(errMsg);
      const message = PingPong.create(payload);
      const buffer = PingPong.encode(message).finish();
      socket.write(buffer);
    } else if(res.messageType=== '2'){
        const message = Data.decode(data)
        const payload = message.data;
        console.log(payload.key,'payload');
        M.set(payload.key,payload.value);
        console.log(M,'m')
    }
  });
```
* 完成简单的set方法

![](https://static01.imgkr.com/temp/bb372af953924870b7acdee791ced50f.png)

* 定义`RedisGet`方法:

```
const M = new Map();
M.set('1','Peter酱牛逼')

function RedisGet() {
  const msg = { messageType: '3', data: { key: '1' } };
  const errMsg = Data.verify(msg);
  if (errMsg) throw Error(errMsg);
  const message = Data.create(msg);
  const buffer = Data.encode(message).finish();
  client.write(buffer);
}
```
* 服务端对类型messageType为'3'的进行处理
```
else if (res.messageType === '3') {
      const message = Query.decode(data);
      const res = M.get(message.key);
      console.log(res, 'res');
    }
```

![](https://static01.imgkr.com/temp/cddb79e997e64a88bd59e01a4d416876.png)

* 此时get方法完成，得到数据，再定义一个GetData传输下，先序列化再反序列化就完成了? 肯定不会这么简单
* redis的set、get的非常高频的操作,即便是缓存,不是存入数据库，但还是有失败风险,因为我们是通过socket通讯,如果网络抖动或者其他原因导致通讯失败,这个数据没有进入cache,那么就有问题
#### set方法应该有cb(回调),get方法应该有返回值
* 基于以上两种需求,需要设计新的模式去完成这个set、get功能
* 无论成功、失败都能知道结果

#### 真正的开始实现Redis
* 首先确定通讯依然使用socket,长连接
* 心跳保活需要
* 需要引入发送队列
* set能触发cb,get能返回数据(基于`promise | generator|async`)
* 基于pb协议传输
* 有ACK回复机制,这样能确保cb调用

#### 处理队列
* set和set的回调队列
* 我之前想set成功后,应该把数据在客户端保护一份，这样redis.get就可以直接拿到数据了,不需要通过socket,后面考虑到多个机器连接redis，应该保持数据一致性,此处应该有多种方法保证数据一致性..
```
const cbQueue = []; //回调队列
const setQueue = []; //set的队列
const getQueue = []; //get的队列
```
* 实现set队列,触发`cb`,改造redisSet
```
function RedisSet(data, cb) {
  cbQueue.push(cb);
  setQueue.push(data);
  console.log(cbQueue, setQueue, "queue");
  const errMsg = Data.verify(data);
  if (errMsg) throw Error(errMsg);
  const message = Data.create(data);
  const buffer = Data.encode(message).finish();
  client.write(buffer);
}

```
* 服务端收到set后，在Map中追加数据,用socket写入通入客户端
```
else if (res.messageType === '2') {
      const message = Data.decode(data);
      const payload = message.data;
      M.set(payload.key, payload.value);
    } 
```
####  M.set后,使用socket通知客户端缓存写入成功
* 首先定义pb字段,我们使用message_type = "5"来通知
```
message setSucceed {
    string message_type = 1;  
}
```

```
const msg = { messageType: "5" };
const errMsg = setSucceed.verify(msg);
if (errMsg) throw Error(errMsg);
const m = setSucceed.create(msg);
const buffer = setSucceed.encode(m).finish();
socket.write(buffer);
```
* 前端触发set队列的cb,并且消费这个队列
```
  RedisSet(data, () => {
        console.log("set成功,触发cb");
      });
      
 else if (decodedMessage.messageType === "5") {
      const cb = cbQueue.shift();
      cb && cb();
    }
```
* 结果,符合预期
![](https://static01.imgkr.com/temp/4054a19cc5d148b9a5507fb729dbebd3.png)

#### 但是这个操作,是有BUG的
* 因为socket写入都是异步,等返回的时候,那么就有可能乱序,这里需要加入ACK回复机制
* 在客户端set的时候,生成一个UUID,将这个UUID带着给服务端,服务端的Map数据存储完成后,就可以将这个UUID带着回来给客户端(相当于ACK机制)
* 客户端接受到`ACK`,触发cbQueue中的cb(此时将cbQueue数组类型改成Map,方便处理),触发完成后remove掉`cb`即可
* 加入UUID 
```
yarn add node-uuid
const uuid = require('node-uuid');

// v1 根据时间戳和随机数生成的uuid
const creatuuid= uuid.v1()
```
* 修改Data的pb文件,增加uuid字段
```
message Data {
     string message_type = 1; // 会变成 messageType
     string uuid = 2;
     Payload data = 3;
}
```
* 修改set方法，每次set用UUID生成key,value为cb,存储在Map中
```
function RedisSet(data, cb) {
  // v1 根据时间戳和随机数生成的uuid
  const creatuuid = uuid.v1();
  data.uuid = creatuuid;
  cbQueue.set(creatuuid, cb);
  const errMsg = Data.verify(data);
  if (errMsg) throw Error(errMsg);
  const message = Data.create(data);
  const buffer = Data.encode(message).finish();
  client.write(buffer);
}
```
* 服务端修改，返回ACK字段，通知客户端消费cb
```
else if (res.messageType === '2') {
      const message = Data.decode(data);
      const payload = message.data;
      M.set(payload.key, payload.value);
      const msg = { messageType: '5', uuid: message.uuid };
      const errMsg = setSucceed.verify(msg);
      if (errMsg) throw Error(errMsg);
      const m = setSucceed.create(msg);
      const buffer = setSucceed.encode(m).finish();
      socket.write(buffer);
    } 
```
* 客户端收到set成功的ACK,根据UUId，消费`cb`
```
 else if (decodedMessage.messageType === '5') {
      const res = setSucceed.decode(data);
      const cb = cbQueue.get(res.uuid);
      cb && cb() && cbQueue.remove(res.uuid);
    }
```

#### 这样我们set触发cb已经完成,剩下get得到返回值
* 其实这个get,也要推敲一下,我当初想粗糙点,直接把所有数据同步到客户端,然后客户端根据setQueue & cbQueue去追加数据,后面觉得很不优雅,因为redis还有集群,数据同步,预热，两种不同数据持久化等等
* 此处可以通过curl、http请求等形式拿到,因为我没看过redis源码,不清楚怎么实现的
* 但是基于Node.js的redis使用，是直接通过redis.get()，传入回调函数后得到一个数据,没有使用promise和await（我记得是这样）

#### 定义get的pb字段
* 定义Query
```
message Query {
    string message_type = 1; 
    string key = 2;
    string uuid =3;
}
```

* 定义get方法
```
get = function (key, cb) {
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
```
* 首先发送messageType为6的包给服务端,服务端对6的type做处理
```
else if (res.messageType === "6") {
      const message = Query.decode(data);
      const res = M.get(message.key);
      const msg = { messageType: "6", uuid: message.uuid, data: res };
      const errMsg = getSucceed.verify(msg);
      if (errMsg) throw Error(errMsg);
      const m = getSucceed.create(msg);
      const buffer = getSucceed.encode(m).finish();
      socket.write(buffer);
    }

```
* 如果是6，代表是客户端的get操作，我们先去Map中查询,然后返回通知给客户端,type还是6
* 客户端接受到6的msgtype后，通过拿到的data和uuid，调用getCbQueue中的对应回掉，并且delete掉
```
else if (decodedMessage.messageType === '6') {
        const res = getSucceed.decode(data);
        const cb = getCbQueue.get(res.uuid);
        cb && cb(res.data);
        getCbQueue.delete(res.uuid);
      }
```

### 很多人想看我真实的代码,我贴出来我优化后的代码吧,我觉得真的很整洁.


* 通过类实现redis，静态方法定义

![](https://static01.imgkr.com/temp/5f63301b0da247cea593e70462849022.png)

* 如何使用我的Redis?
```
const Redis = require('./redis');
const port = 6380;
const host = '127.0.0.1';
const RedisStore = Redis.connect(port, host);

const data = { messageType: '2', data: { key: '1', value: '2' } };

RedisStore.set(data, () => {
  console.log('set成功,触发cb');
});

RedisStore.get('1', (data) => {
  console.log('get成功data:', data);
});


```

* 达到预期

![](https://static01.imgkr.com/temp/04217722cf6940d487da0ec191e5d963.png)
 
### 还缺守护进程、数据持久化
* 守护进程,我之前写过`cluster`源码解析,用pm2 docker谁都会，但是真的要自己实现，还是要思考一下
* 有兴趣学习的，可以看我之前的解析Cluster源码、PM2原理文章`https://segmentfault.com/a/1190000021230376`

![](https://static01.imgkr.com/temp/be5f2f250e134ae3a66b3aa4d39e194a.png)

* PM2这个轮子造起来，可能比redis不相上下,以后有机会可以写一个,我们今天直接用PM2启动即可达到守护进程效果
```
pm2 start server.js
```
#### 实现redis数据持久化
* redis数据持久化两种方式
  * RDB：指定的时间间隔内保存数据快照
  * AOF：先把命令追加到操作日志的尾部，保存所有的历史操作
* 这里持久化，其实有点麻烦，redis的key数据类型非常丰富
* redis数据持久化用来做什么？
  * redis数据存储在内存中，如果服务器重启或者redis挂了/重启，如果不做数据持久化，那么数据就丢了

#### 先是实现AOF,追加到日志尾部
* 在服务端接受到redis.set的时候进行日志追加
```
 M.set(payload.key, payload.value);
      fs.appendFile(
        './redis.db',
        `${payload.key},${payload.value}\n`,
        (error) => {
          if (error) return console.log('追加文件失败' + error.message);
          console.log('追加成功');
        }
      );
```
* 结果
![](https://static01.imgkr.com/temp/040c7a0a515b4464b86eab819bf4c146.png)

* 这样写是有问题的,到时候取值的时候不好取，这里可以用到我之前手写富文本编辑器的原理,用零宽字符占位,然后读取数据时候再替换分割~

#### 什么是零宽度字符
* 一种不可打印的Unicode字符, 在浏览器等环境不可见, 但是真是存在, 获取字符串长度时也会占位置, 表示某一种控制功能的字符.

* 常见的零宽字符有哪些
* 零宽空格（zero-width space, ZWSP）用于可能需要换行处。
```
    Unicode: U+200B  HTML: &#8203;
```
* 零宽不连字 (zero-width non-joiner，ZWNJ)放在电子文本的两个字符之间，抑制本来会发生的连字，而是以这两个字符原本的字形来绘制。
```
    Unicode: U+200C  HTML: &#8204;
```
* 零宽连字（zero-width joiner，ZWJ）是一个控制字符，放在某些需要复杂排版语言（如阿拉伯语、印地语）的两个字符之间，使得这两个本不会发生连字的字符产生了连字效果。
```
    Unicode: U+200D  HTML: &#8205;
```
* 左至右符号（Left-to-right mark，LRM）是一种控制字符，用于计算机的双向文稿排版中。
```
    Unicode: U+200E  HTML: &lrm; &#x200E; 或&#8206;
```
* 右至左符号（Right-to-left mark，RLM）是一种控制字符，用于计算机的双向文稿排版中。
```
    Unicode: U+200F  HTML: &rlm; &#x200F; 或&#8207;
```
* 字节顺序标记（byte-order mark，BOM）常被用来当做标示文件是以UTF-8、UTF-16或UTF-32编码的标记。
```
    Unicode: U+FEFF
```
* 零宽度字符在JavaScript的应用
* 数据防爬
* 将零宽度字符插入文本中,干扰关键字匹配。爬虫得到的带有零宽度字符的数据会影响他们的分析，但不会影响用户的阅读数据。
* 信息传递
* 将自定义组合的零宽度字符插入文本中，用户复制后会携带不可见信息，达到传递作用。

#### 使用零宽字符
* 我喜欢用`\u200b\`，因为它够2b
```
 `${payload.key},${payload.value}\u200b\n`,
```
* 插入持久化效果

![](https://static01.imgkr.com/temp/454575ab5a414e23a40f1a6bf8cd1bf9.png)

#### 数据预热
* 在服务器监听端口事件中进行数据预热,读取磁盘数据到内存中
```
//服务器监听事件
server.on('listening', function () {
  fs.readFile('./redis.db', (err, data) => {
    console.log(data.toString(), 'xxx');
  });
  console.log('server listening:' + server.address().port);
});

```
* 结果 符合预期

![](https://static01.imgkr.com/temp/1faf7ff6912b4714a8e32a967d99bceb.png)

* 上面这样写，其实有问题，为了更好的分割提取磁盘冷数据，我换了下分割的零宽字符
```
 `${payload.key}-${payload.value}\u200b`,
```
* 插入后的数据变成了这样

![](https://static01.imgkr.com/temp/213493f1ccb54265bd6a050c1417639b.png)

* 读取数据算法,也是要思考下 
```
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
```
* 最终效果,符合预期

![](https://static01.imgkr.com/temp/4c4c28c8faf549ceaf3172f6ea965e05.png)

* 在redis出错的时候，将数据刷入磁盘中以及定期持久化数据，如果要实现，也可以类似的思路,当然这并不是redis的真正实现,只是一个模拟.


#### 如果感觉写得不错，关注下微信公众号 [`前端巅峰`]
* 我是Peter，架构设计过20万人端到端加密超级群功能的桌面IM软件,我的微信:`CALASFxiaotan`
* 另外欢迎收藏我的资料网站:前端生活社区:`https://qianduan.life`,感觉对你有帮助，可以右下角点个在看，关注一波公众号:[`前端巅峰`]
