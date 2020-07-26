const http = require('http')
const configs = require('./config')
const fs = require('fs')
const jade = require('jade')
const { join, extname } = require('path')
const { promisify } = require('util')
const statAsync = promisify(fs.stat)
const readdirAsync = promisify(fs.readdir)
const mameTypeFn = require('./mime')
const etagFn = require('etag')
const { createDeflate, createGzip } = require("zlib")
const { exec } = require("child_process")
module.exports = function server(argv) {
    const config = Object.assign(configs, argv)
    if (process.platform) {
        const url = `${config.host}:${config.port}`
        switch (process.platform) {
            case "darwin":
                exec(`open ${url}`)
                break
            case "win32":
                exec(`start chrome  ${url}`)
                break
        }
    }
    const server = http.createServer(async (req, res) => {

        const url = req.url.split('?')[0]
        if (url === "/favicon.ico") {
            const urls = join(__dirname, './icon/1.png')
            const w = fs.createReadStream(urls)
            w.pipe(res)
        } else {
            try {
                //通过当前文件路径文件和index.html拼起来
                let absolutePath = join(__dirname, url)
                absolutePath = decodeURI(absolutePath)
                let urlPath = ''
                if (url === '/') {
                    urlPath = ''
                } else {
                    urlPath = url
                }
                //node.js的一个读取文件信息的api 我封装成了promise风格
                stat = await statAsync(Buffer.from(absolutePath))
                if (stat.isFile()) {
                    //浏览器缓存，怎么实现的？
                    const ifModifiedSince = req.headers['if-modified-since']
                    const ifNoneMatch = req.headers['if-none-match']
                    //读取文件流--相当于二进制的文件内容
                    const r = fs.createReadStream(absolutePath)
                    //拿到响应的文件类型信息
                    const result = mameTypeFn(absolutePath)
                    //如果有这个需要兼容http1.0版本，那么就要设置这个头部
                    if (config.cache.expires) {
                        res.setHeader("expries", new Date(Date.now() + (config.cache.maxAge * 1000)))
                    }
                    //如果需要配置lastModified,那么就要根据读取到的文件信息，设置响应头部
                    if (config.cache.lastModified) {
                        res.setHeader("last-modified", stat.mtime.toUTCString())
                    }
                    //如果需要配置etag,那么就配置etag
                    if (config.cache.etag) {
                        res.setHeader('Etag', etagFn(stat))
                    }
                    //开启gzip 压缩文件
                    function zips() {
                        const ext = extname(absolutePath).split('.').pop()
                        if (config.compressExts.includes(ext)) {
                            const result = req.headers['accept-encoding']
                            if (!result.match(/\bgzip\b/) && !result.match(/\bdeflate\b/)) {
                                return r
                            }
                            if (result.match(/\bgzip\b/)) {
                                res.setHeader("Content-Encoding", "gzip")
                                return r.pipe(createGzip())
                            }

                            if (result.match(/\bdeflate\b/)) {
                                res.setHeader("Content-Encoding", "deflate")
                                return r.pipe(createDeflate())
                            }
                        }
                    }

                    const zipStream = zips()

                    //状态码怎么实现的？ 
                    if (ifNoneMatch === etagFn(stat) || ifModifiedSince === stat.mtime.toUTCString()) {
                        //说明文件并没有修改，可以走缓存 状态码304 
                        res.writeHead(304, 'use cache', {
                            "Content-Type": result
                        })
                        //Gzip压缩 库实现的
                        zipStream.pipe(res)
                    } else {
                        //如果文件改动过，就是200状态码，缓存失效 需要重新获取
                        res.writeHead(200, 'not cache', {
                            "Content-Type": result
                        })
                           //Gzip压缩 库实现的
                        zipStream.pipe(res)
                    }
                    [a.php,b.php,c.php]
                } else if (stat.isDirectory()) {
                    const result = await readdirAsync(absolutePath)
                    const url = join(__dirname, './jade/index.jade')
                    const html = jade.renderFile(url, { data: result, urlPath })
                    res.end(html)
                }
            } catch {
                const url = join(__dirname, './jade/404.jade')
                const html = jade.renderFile(url)
                res.end(html)
            }
        }
    })
    //8888端口监听
    server.listen(config.port, config.host, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log(`服务器运行在:${config.host}:${config.port}`)
        }
    })
}