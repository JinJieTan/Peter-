const Server = require('./app.js')
const argv = require('yargs').option('p', {
    alias: 'port',
    describe: '静态资源服务器端口号'
}).option('h', {
    alias: 'host',
    describe: '静态资源服务器主机名'
}).option('r', {
    alias: 'rootPath',
    describe: '静态资源服务器根目录'
}).argv

const result = new Server(argv)