# 前言
Redux是JavaScript状态容器，提供可预测化的状态管理。本文将会详细介绍Redux五个核心方法
createStore，applyMiddleware，bindActionCreators，combineReducers，compose的实现原理，最后将自己封装一个小巧完整的redux库，随后会介绍一下经常与Redux一起结合使用的Redux常用中间件redux-logger，redux-thunk，redux-promise等中间件的实现原理。<br>

本文对于Redux是什么及Redux几个核心方法如何使用只会做简单介绍，如果还没用过Redux建议先学习基础知识。<br>

# 开始
## createStore
首先，我们先来看一种使用Redux的基础场景：
```
function reducer(state, action) {}

const store = createStore(reducer) //用reducer生成了store

store.subscribe(() => renderApp(store.getState())) //注册state变化的回调

renderApp(store.getState()) //初始化页面

store.dispatch(xxxaction) //发出action
```
上面代码是一个用到Redux的基础场景，首先定义了一个reducer，然后用这个reducer生成了store，在store上注册当state发生变化后要执行的回调函数，然后使用初始state先渲染一下页面，当页面有操作时，store.dispatch发出一个action，action和旧的state经过reducer计算生成新的state，此时state变化，触发回调函数使用新的state重新渲染页面，这个简单的场景囊括了整个redux工作流，
如图所示：
![redux工作流](https://user-gold-cdn.xitu.io/2018/6/19/16418441be61466e?w=638&h=479&f=jpeg&s=21322)<br/>
这个场景主要用到Redux里面的createStore方法，这是Redux里最核心的方法，下面我们简单实现一下这个方法。
```
function createStore(reducer) {
    let state = null //用来存储全局状态
    let listeners = [] //用来存储状态发生变化的回调函数数组

    const subscribe = (listener) => { //用来注册回调函数
        listeners.push(listener)
    }
    const getState = () => state //用来获取最新的全局状态
    const dispatch = (action) => { //用来接收一个action，并利用reducer，根据旧的state和action计算出最新的state，然后遍历回调函数数组，执行回调.
        state = reducer(state, action) //生成新state
        listeners.forEach((listener) => listener()) //执行回调
    }

    dispatch({}) //初始化全局状态
    return { getState, dispatch, subscribe } //返回store对象，对象上有三个方法供外部使用
}
```
其实实现这个方法并不复杂

1. 首先，定义2个变量，一个是state，一个是listeners，state用来存放全局状态，listeners用来存储状态发生变化的回调函数数组。
2. 然后定义三个方法subscribe，getState，dispatch。subscribe用于注册回调函数，getState用来获取最新的state状态，dispatch用来接收一个action，并利用reducer，根据旧的state和action计算出最新的state，然后遍历回调函数数组，执行回调。
3. 当调用createStore时，会先执行dispatch({})利用reducer生成一个初始state，然后返回一个store对象，对象上挂载着getState, dispatch, subscribe这三个方法供外部调用

经过以上三步，我们便实现了一个简单的createStore方法。

## combineReducers
我们在开发稍微大一些的项目时reducer一般有多个，我们会一般会建立一个reducers文件夹，里面存储项目中用到的所有reducer，然后使用一个combineReducers方法将所有reducer合并成一个传给createStore方法。
```
import userInfoReducer from './userinfo.js'
import bannerDataReducer from './banner.js'
import recordReducer from './record.js'
import clientInfoReducer from './clicentInfo.js'

const rootReducer = combineReducers({
    userInfoReducer,
    bannerDataReducer,
    recordReducer,
    clientInfoReducer
})

const store = createStore(rootReducer)
```
接下来，我们就一起来实现combineReducers这个方法：
```
const combineReducers = reducers => (state = {}, action) => {
    let currentState = {};
    for (let key in reducers) {
        currentState[key] = reducers[key](state[key], action);
    }
    return currentState;
};
```
1. 首先combineReducers这个函数接收一个reducer集合，返回一个合并后的reducer函数，所以返回的函数传参仍然和平常的reducer一样，接收state和action，返回新的state。
2. 然后声明一个currentState对象，用来存储全局状态，接着遍历reducers数组，使用reducer函数生成对应的state对象挂载到currentState上。
比如说reducers里传入了2个reducer`{userInfoReducer,bannerDataReducer}`，userInfoReducer里state本来是这样：`{userId:1,name:"张三"}`，而bannerDataReducer里的state本来是`{pictureId:1,pictureUrl:"http://abc.com/1.jpg"}`
合并以后的currentState变为
```
{
    userInfoReducer: {
        userId: 1,
        name: "张三"
    },
    bannerDataReducer: {
        pictureId: 1,
        pictureUrl: "http://abc.com/1.jpg"
    }
}
```
到此我们实现了第二个方法combineReducers。
## bindActionCreators
接下来介绍bindActionCreators这个方法，这是redux提供的一个辅助方法，能够让我们以方法的形式来调用action。同时，自动dispatch对应的action。它接收2个参数，第一个参数是接收一个action creator，第二个参数接收一个 dispatch 函数，由 Store 实例提供。

比如说我们有一个TodoActionCreators

```
export function addTodo(text) {
    return {
      type: 'ADD_TODO',
      text
    };
}
export function removeTodo(id) {
   return {
     type: 'REMOVE_TODO',
     id
   };
}
```
我们之前需要这样使用:
```
import * as TodoActionCreators from './TodoActionCreators';

let addReadAction = TodoActionCreators.addTodo('看书');
dispatch(addReadAction);

let addEatAction = TodoActionCreators.addTodo('吃饭');
dispatch(addEatAction);

let removeEatAction = TodoActionCreators.removeTodo('看书');
dispatch(removeEatAction);
```
现在只需要这样：
```
import * as TodoActionCreators from './TodoActionCreators';
let TodoAction = bindActionCreators(TodoActionCreators, dispatch);

TodoAction.addTodo('看书')
TodoAction.addTodo('吃饭')
TodoAction.removeTodo('看书')
```
好了，说完了如何使用，我们来实现一下这个方法
```
function bindActionCreator(actions, dispatch) {
    let newActions = {};
    for (let key in actions) {
        newActions[key] = () => dispatch(actions[key].apply(null, arguments));
    }
    return newActions;
}
```
方法实现也不难，就是遍历ActionCreators里面的所有action，每个都使用一个函数进行包裹dispatch行为并将这些函数挂载到一个对象上对外暴露，当我们在外部的调用这个函数的时候，就会自动的dispatch对应的action，这个方法的实现其实也是利用了闭包的特性。<br>

这个方法在使用react-redux里面经常见到，等讲react-redux实现原理时会再说一下。
## compose
最后，还剩两个方法，一个是compose，一个是applyMiddleware，这两个都是使用redux中间件时要用到的方法，先来说说compose这个方法，这是一个redux里的辅助方法，其作用是把一系列的函数，组装生成一个新的函数，并且从后到前依次执行，后面函数的执行结果作为前一个函数执行的参数。<br>

比如说我们有这样几个函数:
```
function add1(str) {
    return str + 1
}

function add2(str) {
    return str + 2
}

function add3(str) {
    return str + 3
}
```
我们想依次执行函数，并把执行结果传到下一层就要像下面一样一层套一层的去写:<br>
`let newstr = add3(add2(add1("abc")))  //"abc123"`<br>
这只是3个，如果数量多了或者数量不固定处理起来就很麻烦，但是我们用compose写起来就很优雅：
```
let newaddfun = compose(add3, add2, add1);
let newstr = newaddfun("abc") //"abc123"
```
那compose内部是如何实现的呢？
```
function compose(...funcs) {
    return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
```
其实核心代码就一句，这句代码使用了reduce方法巧妙地将一系列函数转为了`add3(add2(add1(...args)))`这种形式，我们使用上面的例子一步一步地拆分看一下，当调用`compose(add3, add2, add1)`，funcs是add3, add2, add1，第一次进入时a是add3，b是add2，展开就是这样子：`（add3, add2）=>(...args)=>add3(add2(...args))`,传入了add3, add2，返回一个这样的函数`(...args)=>add3(add2(...args))`，然后reduce继续进行，第二次进入时a是上一步返回的函数`(...args)=>add3(add2(...args))`，b是add1，于是执行到`a(b(...args)))`时，`b(...args)`作为a函数的参数传入，变成了这种形式：`(...args)=>add3(add2(add1(...args)))`，是不是很巧妙。

## applyMiddleware
最后我们来看最后一个方法applyMiddleware，我们在redux项目中，使用中间件时一般这样写：
```
import thunk from 'redux-thunk'
import logger from 'redux-logger'
const middleware = [thunk, logger]
const store = createStore(rootReducer, applyMiddleware(...middleware))
```
上面我们用到了thunk和logger这两个中间件，在createStore创建仓库时传入一个新的参数applyMiddleware(...middleware)，在此告诉redux我们要使用的中间件，所以我们要先改造一下createStore方法，让其支持中间件参数的传入。
```
function createStore(reducer, enhancer) {
    //如果传入了中间件函数，使用中间件增强createStore方法
    if (typeof enhancer === 'function') {
        return enhancer(createStore)(reducer)
    }
    let state = null
    const listeners = []
    const subscribe = (listener) => {
        listeners.push(listener)
    }
    const getState = () => state
    const dispatch = (action) => {
        state = reducer(state, action)
        listeners.forEach((listener) => listener())
    }
    dispatch({})
    return { getState, dispatch, subscribe }
}
```
然后接下来以redux-logger中间件为例来分析一下redux中间件的实现方式。
首先我们可以先思考一下，如果我们不用logger中间件，想实现logger的功能该怎样做呢？
```
let store = createStore(reducer);
let dispatch = store.dispatch;
store.dispatch = function (action) {
  console.log(store.getState());
  dispatch(action);
  console.log(store.getState())
};
```
我们可以在原始dispatch方法外面包装一层函数，让发起真正的dispatch之前和之后都打印一下日志，调用时调用包装后的这个dispatch函数，其实redux中间件原理的思路就是这样的：将store的dispatch进行替换，换成一个功能增强了但是仍然具有dispach功能的新函数。<br>

那applyMiddleware方法里是如何改造dispatch来增强功能的呢？首先我们来看个简单版本，假如我们只有一个中间件，如何实现applyMiddleware方法呢？
```
function applyMiddleware(middleware) {
    return function a1(createStore) {
        return function a2(reducer) {
            //取出原始dispatch方法
            const store = createStore(reducer)
            let dispatch = store.dispatch

            //包装dispatch
            const middlewareAPI = {
                getState: store.getState,
                dispatch: (action) => dispatch(action)
            }
            let mid = middleware(middlewareAPI)
            dispatch = mid(store.dispatch)
            
            //使用包装后的dispatch覆盖store.dispatch返回新的store对象
            return {
                ...store,
                dispatch
            }
        }
    }
}
//中间件
let logger = function({ dispatch, getState }) {
        return function l1(next) {
            return function l2(action) {
                console.log(getState());
                next(action)
                console.log(getState())
            }
        }
    }
//reducer函数
function reducer(state, action) {
    if (!state) state = {
        count: 0
    }
    console.log(action)
    switch (action.type) {
        case 'add':
            let obj = {...state,
                count: ++state.count
            }
            return obj;
        case 'sub':
            return {...state,
                count: --state.count
            }
        default:
            return state
    }
}

const store = createStore(reducer, applyMiddleware(logger))
```
1. 首先我们定义了的applyMiddleware方法，它接收一个中间件作为参数。然后定义了一个logger中间件函数，它接收dispatch和getState方法以供内部使用。这两个函数Redux源码里都是使用高阶函数实现的，在这里与源码保持一致也使用高阶函数实现，但是为了方便理解，使用具名的function函数代替匿名箭头函数可以看得更清晰。

2. 当我们执行`const store = createStore(reducer,applyMiddleware(logger))`时，首先`applyMiddleware(logger)`执行，将logger存在闭包里，然后返回了一个接收createStore方法的函数a1，将a1这个函数作为第二个参数传入createStore方法，因为传入了第二个参数，所以createstore里面其实会执行这一段代码:
```
if (typeof enhancer === 'function') {
    return enhancer(createStore)(reducer)
}
```
当执行`return enhancer(createStore)(reducer)`，其实执行的是`a1（createStore）(reducer)`，当执行`a1（createStore）`时返回a2，最后return的是`a2(reducer)`的执行结果。

3. 然后，我们看看a2内部都做了些什么，我给这个函数定义了三个阶段，首先为取出原始dispatch阶段，这一阶段执行`createStore(reducer)`方法，并拿出原始的dispatch方法。

4. 接着，我们到了第二个阶段包装原始dispatch，首先我们定义了middlewareAPI用来给中间件函数使用，这里的getState直接使用了store.getState，而dispatch使用函数包了一层，`(action)=>dispatch(action)`，为什么呢，因为我们最终要给中间件使用的dispatch方法，一定是经过各种中间件包装后的dispatch方法，而不是原方法，所以我们这里将dispatch方法设置为一个变量。然后将middlewareAPI传入middleware执行，返回一个函数mid（也就是logger里面的l1），这个函数接收一个next方法作为参数，然后当我们执行`dispatch = mid(store.dispatch)`时，将store.dispatch作为next方法传入，并把返回的函数l2作为新的dispatch，我们可以看到新的dispatch方法其实里面做了和我们上面自己直接改造store.dispatch做了同样的事情：
```
function l2(action) {
    console.log(getState());
    next(action)
    console.log(getState())
}
```
都是接收一个action，先打印日志，然后执行原始的dispatch方法去发一个action，然后再打印日志。

5. 最后到了第三个阶段：使用包装后的dispatch覆盖store.dispatch方法后返回新的store对象。

6. 到此，当我们在外面执行store.dispatch({type:add})时，实际上执行的是包装后的dispatch方法，所以logger中间件就生效了，如图所示真正发起dispatch的前后都打印出了最新状态：

![示例](https://user-gold-cdn.xitu.io/2018/6/20/1641b56a3acc1b5e?w=352&h=90&f=png&s=5021)
现在我们在上一版applyMiddleware的基础上再改造，使其支持多个中间件：
```
import compose from './compose';

function applyMiddleware(...middlewares) {
    return function a1(createStore) {
        return function a2(reducer) {
            const store = createStore(reducer)
            let dispatch = store.dispatch
            let chain = []

            const middlewareAPI = {
                getState: store.getState,
                dispatch: (action) => dispatch(action)
            }
            chain = middlewares.map(middleware => middleware(middlewareAPI))
            dispatch = compose(...chain)(store.dispatch)

            return {
                ...store,
                dispatch
            }
        }
    }
}

let loggerone = function({ dispatch, getState }) {
    return function loggerOneOut(next) {
        return function loggerOneIn(action) {
            console.log("loggerone:", getState());
            next(action)
            console.log("loggerone:", getState())
        }

    }
}
let loggertwo = function({ dispatch, getState }) {
    return function loggerTwoOut(next) {
        return function loggerTwoIn(action) {
            console.log("loggertwo:", getState());
            next(action)
            console.log("loggertwo:", getState())
        }
    }
}
const store = createStore(reducer, applyMiddleware([loggertwo, loggerone]))
```
1. 首先当调用applyMiddleware方法时，由传入一个中间件变为传入一个中间件数组。

2. 然后我们在applyMiddleware方法中维护一个chain数组，这个数组用于存储中间件链。

3. 当执行到 `chain = middlewares.map(middleware => middleware(middlewareAPI))`时，chain里面存放的是`[loggerTwoOut,loggerOneOut]`。

4. 然后下一步我们改造dispatch时用到了我们之前讲过的compose方法，`dispatch=compose(...chain)(store.dispatch)`其实相当于是执行了`dispatch =loggerTwoOut(loggerOneOut(store.dispatch))`，然后这一句`loggerTwoOut(loggerOneOut(store.dispatch))`再次拆开看一下是如何执行的，当执行`loggerOneOut(store.dispatch)`，返回loggerOneIn函数，并将store.dispatch方法作为loggerOneIn里面的next方法。现在函数变成了这样：`loggerTwoOut(loggerOneIn)`，当执行这一句时，返回loggerTwoIn函数，并将loggerOneIn作为loggerTwoIn方法里的next方法。最后给dispatch赋值:`dispatch =loggerTwoIn`。

5. 在外部我们调用`store.dispatch({type:add})`时，实际执行的是`loggerTwoIn({type:add})`,所以会先执行 `console.log("loggertwo:", getState())`，然后执行`next(action)`时执行的其实是`loggerOneIn(action)`,进入到loggerOneIn内部，所以会执行`console.log("loggerone:",getState())`;然后执行`next(action)`，这里的其实执行的是原始的store.dispatch方法,所以会真正的把action提交，提交完后继续执行，执行`console.log("loggerone:",getState())`，然后loggerOneIn执行完毕，执行权交还到上一层loggerTwoIn，loggerTwoIn继续执行，执行`console.log("loggertwo:", getState())`，结束。

![](https://user-gold-cdn.xitu.io/2018/6/20/1641bbde160e3b03?w=306&h=131&f=png&s=7042)
画一张图形象的表示下执行流程：

![流程图](https://user-gold-cdn.xitu.io/2018/6/20/1641b63ee031b471?w=1111&h=594&f=png&s=25983)

到此，applymiddleware方法就讲完了，我们来看下redux官方源码的实现：
```
function applyMiddleware(...middlewares) {
    return (createStore) => (reducer, preloadedState, enhancer) => {
        const store = createStore(reducer, preloadedState, enhancer)
        let dispatch = store.dispatch
        let chain = []

        const middlewareAPI = {
            getState: store.getState,
            dispatch: (action) => dispatch(action)
        }
        chain = middlewares.map(middleware => middleware(middlewareAPI))
        dispatch = compose(...chain)(store.dispatch)

        return {
            ...store,
            dispatch
        }
    }
}
```
我们实现的applyMiddleware方法对比官方除了没有对前后端同构时预取数据preloadedState做支持外，其余功能都完整实现了。
到此我们把redux里所有方法都实现了一遍，当然我们实现的只是每个方法最核心最常用的部分，并没有将redux源码逐字逐句去翻译。因为个人认为对于源码的学习应该抓住主线，学习源码中的核心代码及闪光点，如果对redux其他功能感兴趣的，可以自行看官方源码学习。
## 常用中间件 redux-logger，redux-thunk，redux-promise
接下来，我们将redux常用的三个中间件来实现一下
### redux-logger
```
let logger = function({ dispatch, getState }) {
        return function(next) {
            return function(action) {
                console.log(getState());
                next(action)
                console.log(getState())
            }
        }
    }
```
这个我们上面讲applyMiddleware时已经讲过了，不再多说。
### redux-thunk
redux-thunk在我们平常使用时主要用来处理异步提交action情况，引入了redux-thunk后我们可以异步提交action
```
const fetchPosts = postTitle => (dispatch, getState) => {
    dispatch(requestPosts(postTitle));
    return fetch(`/some/API/${postTitle}.json`)
        .then(response => response.json())
        .then(json => dispatch(receivePosts(postTitle, json)));
};
store.dispatch(fetchPosts('reactjs'))
```
我们可以看到fetchPosts('reactjs')返回的是一个函数，而redux里的dispatch方法不能接受一个函数，Redux官方源码中明确说了，action必须是一个纯粹的对象，处理异步action时需要使用中间件，
```
function dispatch(action) {
    if (!isPlainObject(action)) {
        throw new Error(
            'Actions must be plain objects. ' +
            'Use custom middleware for async actions.'
        )
    }
    ......
}
```
那redux-thunk到底做了什么使dispatch可以传入函数呢？
```
let thunk = function({ getState, dispatch }) {
    return function(next) {
        return function(action) {
            if (typeof action == 'function') {
                action(dispatch, getState);
            } else {
                next(action);
            }
        }
    }
}
```
thunk中间件在内部进行判断,如果传入了一个函数,就去执行它,不是函数就不管交给下一个中间件,以上面的fetchPosts为例,当执行`store.dispatch(fetchPosts('reactjs'))`时,给dispatch传入了一个函数：
```
postTitle => (dispatch, getState) => {
    dispatch(requestPosts(postTitle));
    return fetch(`/some/API/${postTitle}.json`)
        .then(response => response.json())
        .then(json => dispatch(receivePosts(postTitle, json)));
};
```
thunk中间件发现是个函数,于是执行它,先发出一个Action（requestPosts(postTitle)），然后进行异步操作。拿到结果后，先将结果转成 JSON 格式，然后再发出一个Action（receivePosts(postTitle,json)）。这两个Action都是普通对象,所以当dispatch时会走else {next(action);}这个分支,继续执行.这样就解决了dispatch不能接受函数的问题。
### redux-promise
最后讲一个redux-promise中间件.dispatch目前可以支持传入函数了,利用redux-promise我们再让它支持传入promise对象,平时我们在用这个中间件时,一般有两种用法:
写法一，返回值是一个 Promise 对象。
```
const fetchPosts =
    (dispatch, postTitle) => new Promise(function(resolve, reject) {
        dispatch(requestPosts(postTitle));
        return fetch(`/some/API/${postTitle}.json`)
            .then(response => {
                type: 'FETCH_POSTS',
                payload: response.json()
            });
    });
```
写法二，Action 对象的payload属性是一个Promise对象。这需要从redux里引入createAction方法，并且写法也要变成下面这样。
```
import { createAction } from 'redux-actions';

class AsyncApp extends Component {
    componentDidMount() {
        const { dispatch, selectedPost } = this.props
            // 发出同步 Action
        dispatch(requestPosts(selectedPost));
        // 发出异步 Action
        dispatch(createAction(
            'FETCH_POSTS',
            fetch(`/some/API/${postTitle}.json`)
            .then(response => response.json())
        ));
    }
}
```
让我们来实现一下redux-promise中间件:
```
let promise = function({ getState, dispatch }) {
        return function(next) {
            return function(action) {
                if (action.then) {
                    action.then(dispatch);
                } else if (action.payload && action.payload.then) {
                    action.payload.then(payload => dispatch({...action, payload }), payload => dispatch({...action, payload }));
                } else {
                    next(action);
                }
            }
        }
    }
```
我们实现redux-thunk时是判断如果传入function就执行这个function,否则next(action)继续执行;redux-promise同理,当action或action的payload上面有then方法时,我们认为它是promise对象,就让dispatch到promise的then里面再执行,直到dispatch提交的action没有then方法,我们认为它不是promise了,可以执行next(action)交给下一个中间件执行了。