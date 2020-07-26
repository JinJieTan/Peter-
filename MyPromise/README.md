> 本文是一起学习造轮子系列的第一篇，本篇我们将从零开始写一个符合Promises/A+规范的promise，本系列文章将会选取一些前端比较经典的轮子进行源码分析，并且从零开始逐步实现，本系列将会学习Promises/A+，Redux，react-redux，vue，dom-diff，webpack，babel，kao，express，async/await，jquery，Lodash，requirejs，lib-flexible等前端经典轮子的实现方式，每一章源码都托管在github上，欢迎关注~ <br>
# 前言
Promise 是异步编程的一种解决方案，比传统的解决方案回调函数和事件更合理更强大。它由社区最早提出和实现，ES6 将其写进了语言标准，统一了用法，原生提供了Promise对象。本篇不注重讲解promise的用法，关于用法，可以看阮一峰老师的ECMAScript 6系列里面的Promise部分：<br/>



[ECMAScript 6 : Promise对象](http://es6.ruanyifeng.com/#docs/promise)<br/>

本篇主要讲解如何从零开始一步步的实现promise各项特性及功能，最终使其符合Promises/A+规范，因为讲解较细，所以文章略长。
另外，每一步的项目源码都在github上，可以对照参考，每一步都有对应的项目代码及测试代码，喜欢的话，欢迎给个star~<br/>

# 开始
本文promise里用到的异步操作的示例都是使用的node里面的fs.readFile方法，在浏览器端可以使用setTimeout方法进行模拟异步操作。<br/>
## 一. 基础版本
### 目标<br/>
1. 可以创建promise对象实例。<br/>
2. promise实例传入的异步方法执行成功就执行注册的成功回调函数，失败就执行注册的失败回调函数。<br/>
### 实现<br/>
```
function MyPromise(fn) {
    let self = this; // 缓存当前promise实例
    self.value = null; //成功时的值
    self.error = null; //失败时的原因
    self.onFulfilled = null; //成功的回调函数
    self.onRejected = null; //失败的回调函数

    function resolve(value) {
        self.value = value;
        self.onFulfilled(self.value);//resolve时执行成功回调
    }

    function reject(error) {
        self.error = error;
        self.onRejected(self.error)//reject时执行失败回调
    }
    fn(resolve, reject);
}
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    //在这里给promise实例注册成功和失败回调
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
}
module.exports = MyPromise
```
代码很短，逻辑也非常清晰，在then中注册了这个promise实例的成功回调和失败回调，当promise reslove时，就把异步执行结果赋值给promise实例的value，并把这个值传入成功回调中执行，失败就把异步执行失败原因赋值给promise实例的error，并把这个值传入失败回调并执行。<br/>
### 本节代码 <br/>
## 二. 支持同步任务
我们知道，我们在使用es6 的promise时，可以传入一个异步任务，也可以传入一个同步任务，但是我们的上面基础版代码并不支持同步任务，如果我们这样写就会报错：
```
let promise = new Promise((resolve, reject) => {
    resolve("同步任务执行")
});
```
为什么呢？因为是同步任务，所以当我们的promise实例reslove时，它的then方法还没执行到，所以回调函数还没注册上，这时reslove中调用成功回调肯定会报错的。<br/>
### 目标<br/>
使promise支持同步方法<br/>
### 实现
```
function resolve(value) {
    //利用setTimeout特性将具体执行放到then之后
    setTimeout(() => {
        self.value = value;
        self.onFulfilled(self.value)
    })
}

function reject(error) {
    setTimeout(() => {
        self.error = error;
        self.onRejected(self.error)
    })
}
```
实现很简单，就是在reslove和reject里面用setTimeout进行包裹，使其到then方法执行之后再去执行，这样我们就让promise支持传入同步方法，另外，关于这一点，Promise/A+规范里也明确要求了这一点。<br>
`2.2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code.`<br>
### 本节代码

## 三. 支持三种状态
我们知道在使用promise时，promise有三种状态:pending（进行中）、fulfilled（已成功）和rejected（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。另外，promise一旦状态改变，就不会再变，任何时候都可以得到这个结果promise对象的状态改变，只有两种可能：从pending变为fulfilled和从pending变为rejected。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，如果改变已经发生了，你再对promise对象添加回调函数，也会立即得到这个结果。<br/>
### 目标<br/>
1. 实现promise的三种状态。<br/>
2. 实现promise对象的状态改变，改变只有两种可能：从pending变为fulfilled和从pending变为rejected。<br/>
3. 实现一旦promise状态改变，再对promise对象添加回调函数，也会立即得到这个结果。<br/>
### 实现<br/>
```
//定义三种状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function MyPromise(fn) {
    let self = this;
    self.value = null;
    self.error = null;
    self.status = PENDING;
    self.onFulfilled = null;
    self.onRejected = null;

    function resolve(value) {
        //如果状态是pending才去修改状态为fulfilled并执行成功逻辑
        if (self.status === PENDING) {
            setTimeout(function() {
                self.status = FULFILLED;
                self.value = value;
                self.onFulfilled(self.value);
            })
        }
    }

    function reject(error) {
        //如果状态是pending才去修改状态为rejected并执行失败逻辑
        if (self.status === PENDING) {
            setTimeout(function() {
                self.status = REJECTED;
                self.error = error;
                self.onRejected(self.error);
            })
        }
    }
    fn(resolve, reject);
}
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    if (this.status === PENDING) {
        this.onFulfilled = onFulfilled;
        this.onRejected = onRejected;
    } else if (this.status === FULFILLED) {
        //如果状态是fulfilled，直接执行成功回调，并将成功值传入
        onFulfilled(this.value)
    } else {
        //如果状态是rejected，直接执行失败回调，并将失败原因传入
        onRejected(this.error)
    }
    return this;
}
module.exports = MyPromise
```
首先，我们建立了三种状态"pending","fulfilled","rejected",然后我们在reslove和reject中做判断，只有状态是pending时，才去改变promise的状态，并执行相应操作，另外，我们在then中判断，如果这个promise已经变为"fulfilled"或"rejected"就立刻执行它的回调，并把结果传入。 <br/>
### 本节代码
## 四. 支持链式操作
我们平时写promise一般都是对应的一组流程化的操作，如这样：<br/>
`promise.then(f1).then(f2).then(f3)`<br/>
但是我们之前的版本最多只能注册一个回调，这一节我们就来实现链式操作。
### 目标<br/>
使promise支持链式操作
### 实现<br/>
想支持链式操作，其实很简单，首先存储回调时要改为使用数组
```
self.onFulfilledCallbacks = [];
self.onRejectedCallbacks = [];
```
当然执行回调时，也要改成遍历回调数组执行回调函数
```
self.onFulfilledCallbacks.forEach((callback) => callback(self.value));
```
最后，then方法也要改一下,只需要在最后一行加一个return this即可，这其实和jQuery链式操作的原理一致，每次调用完方法都返回自身实例，后面的方法也是实例的方法，所以可以继续执行。
```
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(onFulfilled);
        this.onRejectedCallbacks.push(onRejected);
    } else if (this.status === FULFILLED) {
        onFulfilled(this.value)
    } else {
        onRejected(this.error)
    }
    return this;
}
```
### 本节代码

## 五. 支持串行异步任务
我们上一节实现了链式调用，但是目前then方法里只能传入同步任务，但是我们平常用promise，then方法里一般是异步任务，因为我们用promise主要用来解决一组流程化的异步操作，如下面这样的调取接口获取用户id后，再根据用户id调取接口获取用户余额，获取用户id和获取用户余额都需要调用接口，所以都是异步任务，如何使promise支持串行异步操作呢?<br/>
```
getUserId()
    .then(getUserBalanceById)
    .then(function (balance) {
        // do sth 
    }, function (error) {
        console.log(error);
    });
```
### 目标<br/>
使promise支持串行异步操作

### 实现<br/>
这里为方便讲解我们引入一个常见场景：用promise顺序读取文件内容，场景代码如下：<br>
```
let p = new Promise((resolve, reject) => {
    fs.readFile('../file/1.txt', "utf8", function(err, data) {
        err ? reject(err) : resolve(data)
    });
});
let f1 = function(data) {
    console.log(data)
    return new Promise((resolve, reject) => {
        fs.readFile('../file/2.txt', "utf8", function(err, data) {
            err ? reject(err) : resolve(data)
        });
    });
}
let f2 = function(data) {
    console.log(data)
    return new Promise((resolve, reject) => {
        fs.readFile('../file/3.txt', "utf8", function(err, data) {
            err ? reject(err) : resolve(data)
        });
    });
}
let f3 = function(data) {
    console.log(data);
}
let errorLog = function(error) {
    console.log(error)
}
p.then(f1).then(f2).then(f3).catch(errorLog)

//会依次输出
//this is 1.txt
//this is 2.txt
//this is 3.txt
```
上面场景，我们读取完1.txt后并打印1.txt内容，再去读取2.txt并打印2.txt内容，再去读取3.txt并打印3.txt内容，而读取文件都是异步操作，所以都是返回一个promise，我们上一节实现的promise可以实现执行完异步操作后执行后续回调，但是本节的回调读取文件内容操作并不是同步的，而是异步的，所以当读取完1.txt后，执行它回调onFulfilledCallbacks里面的f1，f2，f3时，异步操作还没有完成，所以我们本想得到这样的输出：
```
this is 1.txt
this is 2.txt
this is 3.txt
```
但是实际上却会输出
```
this is 1.txt
this is 1.txt
this is 1.txt
```
所以要想实现异步操作串行，我们不能将回调函数都注册在初始promise的onFulfilledCallbacks里面，而要将每个回调函数注册在对应的异步操作promise的onFulfilledCallbacks里面，用读取文件的场景来举例，f1要在p的onFulfilledCallbacks里面，而f2应该在f1里面return的那个Promise的onFulfilledCallbacks里面，因为只有这样才能实现读取完2.txt后才去打印2.txt的结果。<br/>

但是，我们平常写promise一般都是这样写的: `promise.then(f1).then(f2).then(f3)`，一开始所有流程我们就指定好了，而不是在f1里面才去注册f1的回调，f2里面才去注册f2的回调。<br/>

如何既能保持这种链式写法的同时又能使异步操作衔接执行呢？我们其实让then方法最后不再返回自身实例，而是返回一个新的promise即可，我们可以叫它bridgePromise，它最大的作用就是衔接后续操作，我们看下具体实现代码：
```
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    const self = this;
    let bridgePromise;
    //防止使用者不传成功或失败回调函数，所以成功失败回调都给了默认回调函数
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected = typeof onRejected === "function" ? onRejected : error => { throw error };
    if (self.status === FULFILLED) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onFulfilled(self.value);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        })
    }
    if (self.status === REJECTED) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onRejected(self.error);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
    if (self.status === PENDING) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            self.onFulfilledCallbacks.push((value) => {
                try {
                    let x = onFulfilled(value);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
            self.onRejectedCallbacks.push((error) => {
                try {
                    let x = onRejected(error);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
}
//catch方法其实是个语法糖，就是只传onRejected不传onFulfilled的then方法
MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}
//用来解析回调函数的返回值x，x可能是普通值也可能是个promise对象
function resolvePromise(bridgePromise, x, resolve, reject) {
   //如果x是一个promise
    if (x instanceof MyPromise) {
        //如果这个promise是pending状态，就在它的then方法里继续执行resolvePromise解析它的结果，直到返回值不是一个pending状态的promise为止
        if (x.status === PENDING) {
            x.then(y => {
                resolvePromise(bridgePromise, y, resolve, reject);
            }, error => {
                reject(error);
            });
        } else {
            x.then(resolve, reject);
        }
        //如果x是一个普通值，就让bridgePromise的状态fulfilled，并把这个值传递下去
    } else {
        resolve(x);
    }
}
```
首先，为防止使用者不传成功回调函数或不失败回调函数，我们给了默认回调函数，然后无论当前promise是什么状态，我们都返回一个bridgePromise用来衔接后续操作。<br/>

另外执行回调函数时,因为回调函数既可能会返回一个异步的promise也可能会返回一个同步结果，所以我们把直接把回调函数的结果托管给bridgePromise，使用resolvePromise方法来解析回调函数的结果，如果回调函数返回一个promise并且状态还是pending，就在这个promise的then方法中继续解析这个promise reslove传过来的值，如果值还是pending状态的promise就继续解析，直到不是一个异步promise，而是一个正常值就使用bridgePromise的reslove方法将bridgePromise的状态改为fulfilled，并调用onFulfilledCallbacks回调数组中的方法，将该值传入，到此异步操作就衔接上了。<br/>

这里很抽象，我们还是以文件顺序读取的场景画一张图解释一下流程：<br/>

当执行`p.then(f1).then(f2).then(f3)`时:<br/>
1. 先执行p.then(f1)返回了一个bridgePromise（p2），并在p的onFulfilledCallbacks回调列表中放入一个回调函数，回调函数负责执行f1并且更新p2的状态.
2. 然后.then(f2)时返回了一个bridgePromise（p3），这里注意其实是p2.then(f2)，因为p.then(f1)时返回了p2。此时在p2的onFulfilledCallbacks回调列表中放入一个回调函数，回调函数负责执行f2并且更新p3的状态.
3. 然后.then(f3)时返回了一个bridgePromise（p4），并在p3的onFulfilledCallbacks回调列表中放入一个回调函数，回调函数负责执行f3并且更新p4的状态.
到此，回调关系注册完了，如图所示：
4. 然后过了一段时间，p里面的异步操作执行完了，读取到了1.txt的内容，开始执行p的回调函数，回调函数执行f1，打印出1.txt的内容“this is 1.txt”，并将f1的返回值放到resolvePromise中开始解析。resolvePromise一看传入了一个promise对象，promise是异步的啊，得等着呢，于是就在这个promise对象的then方法中继续resolvePromise这个promise对象resolve的结果，一看不是promise对象了，而是一个具体值“this is 2.txt”，于是调用bridgePromise(p2)的reslove方法将bridgePromise(p2)的状态更新为fulfilled，并将“this is 2.txt”传入p2的回调函数中去执行。
5. p2的回调开始执行，f2拿到传过来的“this is 2.txt”参数开始执行，打印出2.txt的内容，并将f2的返回值放到resolvePromise中开始解析，resolvePromise一看传入了一个promise对象，promise是异步的啊，又得等着呢........后续操作就是不断的重复4,5步直到结束。

到此，reslove这一条线已经我们已经走通，让我们看看reject这一条线，reject其实处理起来很简单:
1. 首先执行fn及执行注册的回调时都用try-catch包裹，无论哪里有异常都会进入reject分支。
2. 一旦代码进入reject分支直接将bridge promise设为rejected状态，于是后续都会走reject这个分支，另外如果不传异常处理的onRejected函数，默认就是使用throw error将错误一直往后抛，达到了错误冒泡的目的。
3. 最后可以实现一个catch函数用来接收错误。
```
MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}
```
到此，我们已经可以愉快的使用`promise.then(f1).then(f2).then(f3).catch(errorLog)`来顺序读取文件内容了。
### 本节代码

## 六. 达到Promises/A+规范
其实，到支持串行异步任务这一节，我们写的promise在功能上已经基本齐全了，但是还不太规范，比如说一些其他情况的判断等等，这一节我们就比着Promises/A+的规范打磨一下我们写的promise。如果只是想学习promise的核心实现的，这一节看不懂也没关系，因为这一节并没有增加promise的功能，只是使promise更加规范，更加健壮。
### 目标
使promise达到Promises/A+规范，通过promises-aplus-tests的完整测试

### 实现
首先来可以了解一下Promises/A+规范：<br>
相比上一节代码，本节代码除了在resolvePromise函数里增加了几个其他情况的判断外，其他函数都没有修改。完整promise代码如下：<br>
```
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function MyPromise(fn) {
    const self = this;
    self.value = null;
    self.error = null;
    self.status = PENDING;
    self.onFulfilledCallbacks = [];
    self.onRejectedCallbacks = [];

    function resolve(value) {
        if (value instanceof MyPromise) {
            return value.then(resolve, reject);
        }
        if (self.status === PENDING) {
            setTimeout(() => {
                self.status = FULFILLED;
                self.value = value;
                self.onFulfilledCallbacks.forEach((callback) => callback(self.value));
            }, 0)
        }
    }

    function reject(error) {
        if (self.status === PENDING) {
            setTimeout(function() {
                self.status = REJECTED;
                self.error = error;
                self.onRejectedCallbacks.forEach((callback) => callback(self.error));
            }, 0)
        }
    }
    try {
        fn(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

function resolvePromise(bridgepromise, x, resolve, reject) {
    //2.3.1规范，避免循环引用
    if (bridgepromise === x) {
        return reject(new TypeError('Circular reference'));
    }
    let called = false;
    //这个判断分支其实已经可以删除，用下面那个分支代替，因为promise也是一个thenable对象
    if (x instanceof MyPromise) {
        if (x.status === PENDING) {
            x.then(y => {
                resolvePromise(bridgepromise, y, resolve, reject);
            }, error => {
                reject(error);
            });
        } else {
            x.then(resolve, reject);
        }
        // 2.3.3规范，如果 x 为对象或者函数
    } else if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
        try {
            // 是否是thenable对象（具有then方法的对象/函数）
            //2.3.3.1 将 then 赋为 x.then
            let then = x.then;
            if (typeof then === 'function') {
            //2.3.3.3 如果 then 是一个函数，以x为this调用then函数，且第一个参数是resolvePromise，第二个参数是rejectPromise
                then.call(x, y => {
                    if (called) return;
                    called = true;
                    resolvePromise(bridgepromise, y, resolve, reject);
                }, error => {
                    if (called) return;
                    called = true;
                    reject(error);
                })
            } else {
            //2.3.3.4 如果 then不是一个函数，则 以x为值fulfill promise。
                resolve(x);
            }
        } catch (e) {
        //2.3.3.2 如果在取x.then值时抛出了异常，则以这个异常做为原因将promise拒绝。
            if (called) return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
    const self = this;
    let bridgePromise;
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected = typeof onRejected === "function" ? onRejected : error => { throw error };
    if (self.status === FULFILLED) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onFulfilled(self.value);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        })
    }
    if (self.status === REJECTED) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onRejected(self.error);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        });
    }
    if (self.status === PENDING) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            self.onFulfilledCallbacks.push((value) => {
                try {
                    let x = onFulfilled(value);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
            self.onRejectedCallbacks.push((error) => {
                try {
                    let x = onRejected(error);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
}
MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}
// 执行测试用例需要用到的代码
MyPromise.deferred = function() {
    let defer = {};
    defer.promise = new MyPromise((resolve, reject) => {
        defer.resolve = resolve;
        defer.reject = reject;
    });
    return defer;
}
try {
    module.exports = MyPromise
} catch (e) {}
```
我们可以先跑一下测试，需要安装一下测试插件,然后执行测试，测试时注意在加上上面最后的那几行代码才能执行测试用例。
```
1.npm i -g promises-aplus-tests
2.promises-aplus-tests mypromise.js
```
运行测试用例可以看到，我们上面写的promise代码通过了完整的Promises/A+规范测试。<br/>

先撒花高兴一下~✿✿ヽ(°▽°)ノ✿

然后开始分析我们这一节的代码，我们主要在resolvePromise里加了额外的两个判断，第一个是x和bridgePromise是指向相同值时，报出循环引用的错误，使promise符合2.3.1规范，然后我们增加了一个x 为对象或者函数的判断，这一条判断主要对应2.3.3规范，中文规范如图：

这一条标准对应的其实是thenable对象，什么是thenable对象，只要有then方法就是thenable对象,然后我们实现的时候照着规范实现就可以了。
```
else if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
        try {
            // 是否是thenable对象（具有then方法的对象/函数）
            //2.3.3.1 将 then 赋为 x.then
            let then = x.then;
            if (typeof then === 'function') {
            //2.3.3.3 如果 then 是一个函数，以x为this调用then函数，且第一个参数是resolvePromise，第二个参数是rejectPromise
                then.call(x, y => {
                    if (called) return;
                    called = true;
                    resolvePromise(bridgepromise, y, resolve, reject);
                }, error => {
                    if (called) return;
                    called = true;
                    reject(error);
                })
            } else {
            //2.3.3.4 如果 then不是一个函数，则以x为值fulfill promise。
                resolve(x);
            }
        } catch (e) {
        //2.3.3.2 如果在取x.then值时抛出了异常，则以这个异常做为原因将promise拒绝。
            if (called) return;
            called = true;
            reject(e);
        }
    }
```
再写完这个分支的代码后，其实我们已经可以删除`if (x instanceof MyPromise) {}`这个分支的代码，因为promise也是一个thenable对象，完全可以使用上述代码兼容代替。另外，本节代码很多重复代码可以封装优化一下，但是为了看得清晰，并没有进行抽象封装，大家如果觉得重复代码太多的话，可以自行抽象封装。
### 本节代码
## 七. 实现 promise 的all，race，resolve，reject方法
上一节我们已经实现了一个符合Promises/A+规范的promise，本节我们把一些es6 promise里的常用方法实现一下。<br/>
### 目标
实现es6 promise的all，race，resolve，reject方法<br/>
### 实现
我们还是在之前的基础上继续往下写：
```
MyPromise.all = function(promises) {
    return new MyPromise(function(resolve, reject) {
        let result = [];
        let count = 0;
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(function(data) {
                result[i] = data;
                if (++count == promises.length) {
                    resolve(result);
                }
            }, function(error) {
                reject(error);
            });
        }
    });
}

MyPromise.race = function(promises) {
    return new MyPromise(function(resolve, reject) {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(function(data) {
                resolve(data);
            }, function(error) {
                reject(error);
            });
        }
    });
}

MyPromise.resolve = function(value) {
    return new MyPromise(resolve => {
        resolve(value);
    });
}

MyPromise.reject = function(error) {
    return new MyPromise((resolve, reject) => {
        reject(error);
    });
}
```
其实前几节把promise的主线逻辑实现后，这些方法都不难实现，all的原理就是返回一个promise，在这个promise中给所有传入的promise的then方法中都注册上回调，回调成功了就把值放到结果数组中，所有回调都成功了就让返回的这个promise去reslove，把结果数组返回出去，race和all大同小异，只不过它不会等所有promise都成功，而是谁快就把谁返回出去，resolve和reject的逻辑也很简单，看一下就明白了。
### 本节代码
## 八. 实现 promiseify 方法
其实到上一节为止，promise的方法已经都讲完了，这一节讲一个著名promise库bluebird里面的方法promiseify，因为这个方法很常用而且以前面试还被问过。promiseify有什么作用呢？它的作用就是将异步回调函数api转换为promise形式，比如下面这个，对fs.readFile 执行promiseify后，就可以直接用promise的方式去调用读取文件的方法了，是不是很强大。
```
let Promise = require('./bluebird');
let fs = require("fs");

var readFile = Promise.promisify(fs.readFile);
readFile("1.txt", "utf8").then(function(data) {
    console.log(data);
})
```
### 目标
实现bluebird的promiseify方法

### 实现
```
MyPromise.promisify = function(fn) {
    return function() {
        var args = Array.from(arguments);
        return new MyPromise(function(resolve, reject) {
            fn.apply(null, args.concat(function(err) {
                err ? reject(err) : resolve(arguments[1])
            }));
        })
    }
}
```
虽然方法很强大，但是实现起来并没有很难，想在外边直接调用promise的方法那就返回一个promise呗，内部将原来参数后面拼接一个回调函数参数，在回调函数里执行这个promise的reslove方法把结果传出去，promiseify就实现了。

### 本节代码

# 最后
不知不觉写了这么多了，大家如果觉得还可以就给个赞呗，另外每一节的代码都托管到了github上，大家可以对照看那一节的promise实现代码及测试代码，也顺便求个star~<br>


另外，实现一个符合Promises/A+规范的promise不止本文一种实现方式，本文只是选取了一种比较通俗易懂的实现方式作为讲解，大家也可以用自己的方式去实现一个符合Promises/A+规范的promise。

