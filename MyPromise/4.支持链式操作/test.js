let Promise = require("./mypromise")
let fs = require("fs")

let promise = new Promise((resolve, reject) => {
    fs.readFile('../file/1.txt', "utf8", function(err, data) {
        err ? reject(err) : resolve(data)
    });
});
let f1 = function(data) {
    console.log("f1" + data)
}
let f2 = function(data) {
    console.log("f2" + data)
}
let f3 = function(data) {
    console.log("f3" + data)
}
promise.then(f1).then(f2).then(f3)