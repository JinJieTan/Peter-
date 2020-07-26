const Redis = require('./redis');
const port = 6380;
const host = '127.0.0.1';
const RedisStore = Redis.connect(port, host);

const data = { messageType: '2', data: { key: '4', value: '5' } };

RedisStore.set(data, () => {
  console.log('set成功,触发cb');
});

RedisStore.get('1', (data) => {
  console.log('get成功data:', data);
});
