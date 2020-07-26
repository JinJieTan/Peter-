let Promise = require("./mypromise")
let fs = require("fs")

let readFile = Promise.promisify(fs.readFile);

readFile('../file/1.txt', 'utf8').then(data => {
    console.log(data);
}).catch(err => {
    console.log(err);
});