let Promise = require("./mypromise")
let fs = require("fs")

let p1 = new Promise((resolve, reject) => {
    fs.readFile('../file/1.txt', "utf8", function(err, data) {
        err ? reject(err) : resolve(data)
    });
})

let p2 = new Promise((resolve, reject) => {
    fs.readFile('../file/2.txt', "utf8", function(err, data) {
        err ? reject(err) : resolve(data)
    });
})

Promise.all([p1, p2]).then(function(result) {
    console.log(result);
}, function(error) {
    console.log(error)
});

Promise.race([p1, p2]).then(function(result) {
    console.log(result);
}, function(error) {
    console.log(error)
});