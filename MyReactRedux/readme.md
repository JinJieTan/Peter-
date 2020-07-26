
# 前言
上一章我们写了一个redux，当redux与react结合时一般为了方便会使用react-redux，
这个库是可以选用的。实际项目中，应该权衡一下，是直接使用 Redux，还是使用 React-Redux。后者虽然提供了便利，但是需要掌握额外的 API，并且要遵守它的组件拆分规范。
本文对于react-redux的用法不会过多介绍，重点仍然放在源码实现上。如果还不太了解如何使用，可以看相关文章学习。<br>

# 开始
## context
讲React-Redux前，我们先来讲一下React.js里的context。React.js里的context一直被视为一个不稳定的、危险的、可能会被去掉的特性而不被官网文档所记载，但是使用它却非常方便，比如说我们有一棵很庞大的组件树，在我们没有使用redux时我们想要改变一个状态并让所有组件生效，我们需要一层一层的往下传props。但是有了context就很简单了。某个组件只要往自己的context里面放了某些状态，这个组件之下的所有子组件都可以直接访问这个状态而不需要通过中间组件的传递。

例如有这么一棵组件树：

![props传递](https://user-gold-cdn.xitu.io/2018/7/3/1645dcdb9e852809?w=1111&h=594&f=png&s=12456)
userinfo用户信息这个数据是很多组件都需要用的，所以我们按照正常的思路在根节点的 Index 上获取，然后把这个状态通过 props一层层传递下去，最终所有组件都拿到了userinfo，进行使用。
但是这样有个问题：<br>

**如果组件层级很深的话，用props向下传值就是灾难。**<br>

我们想，如果这颗组件树能够全局共享这个一个状态仓库就好了，我们要的时候就去状态仓库里取对应的状态，不用手动地传，这该多好啊。
![全局状态](https://user-gold-cdn.xitu.io/2018/7/2/1645b89c4f085a7f?w=1111&h=594&f=png&s=11665)
React.js 的 context 就是这么一个东西，某个组件只要往自己的 context 里面放了某些状态，这个组件之下的所有子组件都直接访问这个状态而不需要通过中间组件的传递，来看下具体怎么用：
```
//在根组件上将userInfo放入context
class Index extends Component {
    static childContextTypes = {
        userInfo: PropTypes.object
    }

    constructor() {
        super()
        this.state = { 
            userInfo: {
                name:"小明"，
                id：17
                } 
        }
    }

    getChildContext() {
        return { userInfo: this.state.userInfo }
    }

    render() {
        return ( <div >
                    <Header/>
                </div>
        )
    }
}

class Header extends Component {
    render() {
        return ( <div>
                <Title/>
            </div>
        )
    }
}
class Title extends Component {
    static contextTypes = {
        title: PropTypes.object
    }
    render() {
        // 无论组件层级有多深，子组件都可以直接从context属性获取状态
        return ( <h1> 欢迎{ this.context.userInfo.name } </h1>)
    }
}
```
上面，我们将userInfo定义在了根组件Index上，并且将它挂载到Index的context上，之后无论下面有多少层子组件，都可以直接从context上获取这个title状态了。<br>

那么既然context用着这么方便还用redux管理全局状态干什么？<br>

因为context里面的数据能被随意接触就能被随意修改，导致程序运行的不可预料。这也是context一直不建议使用的原因，而redux虽然使用起来很麻烦，但是却能做到修改数据的行为变得可预测可追踪，因为在redux里你必须通过dispatch执行某些允许的修改操作，而且必须事先在action里面明确声明要做的操作。<br>

那么我们能不能结合一下二者的优点，使我们可以既安全又容易的来管理全局状态呢？
## React-Redux

![react-redux](https://user-gold-cdn.xitu.io/2018/7/2/1645b926e056cec3?w=750&h=422&f=jpeg&s=21989)
React-Redux是Redux的作者封装了一个 React 专用的库 ，为了能让React使用者更方便的使用Redux，废话不多说，我们平时在使用React-Redux时一般这样写：
```
// root.js
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import userReducer from 'reducers/userReducer'
import Header from 'containers/header'
const store = createStore(userReducer)

export default class Root extends Component {
    render() {
        return (<div>
                    <Header></Header>
                </div>
        );
    };
}
ReactDOM.render( <Provider store = { store } >
                        <Root/>
                </Provider>, 
document.getElementById('root'));


//containers/header.js
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as userinfoActions from 'actions/userinfo.js';
import fetch from 'isomorphic-fetch'

class Header extends Component {
    constructor() {
        super();
        this.state = {
            username:""
        }
    }
    componentDidMount(){
        this.getUserInfo()
    }
    getUserInfo(){
        fetch("/api/pay/getUserInfo")
            .then(response => {
                return response.json()
            })
            .then(json =>{
                this.props.userinfoActions.login(data);
                this.setState({username: data.username});
            })
            .catch(e => {
                console.log(e)
            })
    }
    render(){
         return (
            <div>
                欢迎用户{this.state.username}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { userinfo: state.userinfo }
}

function mapDispatchToProps(dispatch) {
    return {
        userinfoActions: bindActionCreators(userinfoActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)


// reducers/userReducer.js
export default function userinfo(state = {}, action) {
    switch (action.type) {
        case "USERINFO_LOGIN":
            return action.data
        default:
            return state
    }
}


// actions/useraction.js
export function login(data) {
    return {
        type: "USERINFO_LOGIN",
        data
    }
}
```
上面是一个简单的场景，进入页面获取用户信息后把用户信息里的用户名显示在页面头部，因为用户信息多个组件都需要使用，不光头部组件要用，所以放到redux里共享。<br>

我们可以看到使用react-redux后主要用到里面的两个东西，一个是Provider，一个是connect，另外，还需要自己定义两个函数mapStateToProps, mapDispatchToProps传给connect，接下来我们分别来说说这些东西是干什么的以及如何实现。
### Provider
我们先来看下Provider，Provider是个高阶组件，我们可以看到使用它时将包裹在根组件外边，并且store作为它的props传入进去，它的作用就是
将自己作为所有组件的根组件，然后将store挂载到它的context上让它下面的所有子组件都可以共享全局状态。来看下如何实现：
```
// Provider.js
import React, { Component } from 'react';
import propTypes from 'prop-types';
export default class Provider extends Component {
    static childContextTypes = {
        store: propTypes.object.isRequired
    }
    getChildContext() {
        return { store: this.props.store };
    }
    render() {
        return this.props.children;
    }
}
```
这个还是比较好实现的，写一个组件Provider，将store挂载到Provider的context上，然后使用的时候将Provider包在根组件外边，因为Provider是原来根组件的父组件，所以它就成了真正的根组件，所有下面的子组件都可以通过context访问到store，Provider组件利用context的特性解决了项目里每个组件都需要import一下store才能使用redux的问题，大大增加了便利性。
### connect
首先我们想一下，只用Provider行不行，当然可以，因为store已经挂载到根组件上的context，所有子组件都可以通过context访问到store，然后使用store里的状态，并且用store的dispatch提交action更新状态，但是这样还是有些不便利，因为每个组件都对context依赖过强，造成了组件与store打交道的逻辑和组件本身逻辑都耦合了一起，使得组件无法复用。<br>

我们的理想状态是一个组件的渲染只依赖于外界传进去的props和自己的state，而并不依赖于其他的外界的任何数据，这样的组件复用性是最强的。如何把组件与store打交道的逻辑和组件自身的逻辑分开呢，答案还是使用高阶组件，我们把原来的写的业务组件（如header，list等）外边再包装一层组件，让组件与store打交道的部分放在外层组件，内层组件只负责自身的逻辑，外层组件与内层组件通过props进行交流，这样组件与store打交道的地方就像一层壳一样与组件实体分开了，我们可以将组件实体复用到任何地方只需要换壳即可，connect函数就是负责做上述事情。<br>

![示例](https://user-gold-cdn.xitu.io/2018/7/3/1645eff5cf7946e4?w=1111&h=594&f=png&s=16574)
学习如何实现connect前先来看下使用connect时需要传入的参数，mapStateToProps是一个函数。它的作用就是像它的名字那样，建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系。<br>

mapDispatchToProps是connect函数的第二个参数，用来建立UI组件的参数到store.dispatch方法的映射。也就是说，它定义了用户的哪些操作应该当作 Action，传给Store。它可以是一个函数，也可以是一个对象。<br>

这两个函数我们可以简单的理解为内层组件实体对外层壳组件的要求，组件实体通过mapStateToProps告诉壳组件要store上的哪些状态，壳组件就去store上拿了以后以props的形式传给组件实体，mapDispatchToProps同理。<br>

另外我们在使用connect时一般这样写`export default  connect(mapStateToProps,mapDispatchToProps)(Header)`，所以connect函数要先接收mapStateToProps, mapDispatchToProps这两个函数，再返回一个函数，返回的这个函数的参数接收要包装的组件，最后函数执行返回包好壳的组件。
有朋友可能会问，为什么不直接`connect(mapStateToProps,mapDispatchToProps，Header)`，还得分成两个函数来写，因为React-redux官方就是这么设计的，个人觉得作者是想提高connect函数的复用性，这里我们不去深究它的设计思路，我么还是把重心放到它的代码实现上。
```
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import propTypes from 'prop-types';
export default function connect(mapStateToProps, mapDispatchToProps) {
    return function(WrapedComponent) {
        //壳组件
        class ProxyComponent extends Component {
            static contextTypes = {
                store: propTypes.object
            }
            constructor(props, context) {
                super(props, context);
                this.store = context.store;
                this.state = mapStateToProps(this.store.getState());
            }

            componentWillMount() {
                this.store.subscribe(() => {
                    this.setState(mapStateToProps(this.store.getState()));
                });
            }
            render() {
                let actions = {};
                if (typeof mapDispatchToProps == 'function') {
                    actions = mapDispatchToProps(this.store.disaptch);
                } else if (typeof mapDispatchToProps == 'object') {
                    actions = bindActionCreators(mapDispatchToProps, this.store.dispatch);
                }
                //壳组件内部渲染真正的组件实体，并将业务组件想要的store里的状态及想要触发的action以props形式传入
                return <WrapedComponent {...this.state } {...actions}
                />
            }
        }
        return ProxyComponent;
    }
}
```
我们来看下connect函数做了什么？
1. 首先接收mapStateToProps, mapDispatchToProps并返回一个函数，返回的函数接收一个组件。 
2. 声明了一个壳组件ProxyComponent，并通过context拿到store对象。
3. 然后在constructor里通过传进来的mapStateToProps函数把组件实体想要的状态通过上一步拿到的store对象里面的getState方法拿到并存在壳组件的state上。
4. 在壳组件componentWillMount的生命周期中注册当store状态发生变化的回调函数:store变化，同步更新自己的state为最新的状态，与store上的状态保持一致。
5. 将组件要使用dispatch提交的相关action都封装成函数。这一步我们具体展开看下是怎么做的，首先判断一下mapDispatchToProps是函数还是对象，因为我们在平常使用mapDispatchToProps时一般有两种常见写法，一种是在mapDispatchToProps参数位置传一个函数：
```
function mapDispatchToProps(dispatch) {
    return {
        userinfoActions: bindActionCreators(userinfoActions, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Header)
```
另一种是直接传一个action creator对象<br>
`export default connect(mapStateToProps, ...userinfoActions )(Header)`<br>

我们要保证无论用户传入的mapDispatchToProps是函数还是action creator对象，我们都要让用户在组件实体内提交action时都可以使用this.props.xxx()的方式去提交，而不用直接接触store的dispatch方法。<br>

所以，我们需要借助redux的bindActionCreators方法，

6. 下一步将壳组件state上的所有属性及上一步所有已经封装成函数的action都通过props的方法传给组件实体。
7. 最后，把包装后的组件返回出去，现在我们在组件实体内部就可以使用this.props.username的方式去获取store上的状态，或者使用this.props.userinfoActions.login(data)的方式来提交action，此时组件与store打交道的逻辑和组件自身的逻辑分开，内部组件实体可以进行复用。
