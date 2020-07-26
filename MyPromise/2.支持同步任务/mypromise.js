function MyPromise(fn) {
    let self = this;
    self.value = null;
    self.error = null;
    self.onFulfilled = null;
    self.onRejected = null;

    function resolve(value) {
        setTimeout(() => {
            self.value = value;
            self.onFulfilled(self.value)
        }, 0)
    }

    function reject(error) {
        setTimeout(() => {
            self.error = error;
            self.onRejected(self.error)
        }, 0)
    }
    fn(resolve, reject);
}
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
}
module.exports = MyPromise