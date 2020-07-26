let Promise = require("./mypromise")
let fs = require("fs")

let promise = new Promise((resolve, reject) => {
    resolve("同步任务执行")
});

function successLog(data) {
    console.log(data)
}

function errorLog(error) {
    console.log(error)
}
promise.then(successLog, errorLog);