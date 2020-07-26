let Promise = require("./mypromise")
let fs = require("fs")

let promise = new Promise((resolve, reject) => {
    fs.readFile('../file/1.txt', "utf8", function(err, data) {
        err ? reject(err) : resolve(data)
    });
});

function f1(data) {
    console.log("f1:" + data)
}

function f2(data) {
    console.log("f2:" + data)
}

function errorLog(error) {
    console.log(error)
}

promise.then(f1, errorLog)
setTimeout(() => {
    promise.then(f2, errorLog)
}, 2000)