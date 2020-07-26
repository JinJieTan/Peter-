let Promise = require("./mypromise")
let fs = require("fs")

let promise = new Promise((resolve, reject) => {
    fs.readFile('../file/1.txt', "utf8", function(err, data) {
        err ? reject(err) : resolve(data)
    });
});

function successLog(data) {
    console.log(data)
}

function errorLog(error) {
    console.log(error)
}
promise.then(successLog, errorLog);