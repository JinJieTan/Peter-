# mini-react
这是一个迷你版 react,This is a mini-react

# 欢迎来到`mini-react`

使用步骤 ：

* `npm install -g parcel-bundler`

* `parcel index.html`

本仓库一共三个分支：

* `master` - 最简单的版本

* `diff` - 加入`diff`算法版本

* `diff-async` 异步`state`和`diff`算法



如果有任何问题欢迎联系 `453089136@qq.com` 


![图片描述][1]

> 想要自己实现一个`React`简易版框架，并不是非常难。但是你需要先了解下面这些知识点
如果你能阅读以下的文章，那么会更轻松的阅读本文章：


* [优化你的超大型React应用](https://juejin.im/post/5d35d3ecf265da1bc23fb654)

* [手写一个React脚手架](https://segmentfault.com/a/1190000019126657)


为了降低本文难度，构建工具选择了`parcel`，欢迎加入我们的前端交流群～ `gitHub`仓库源码地址和二维码都会在最后放出来～

### 什么是虚拟`DOM`？

其实就是一个个的具有固定格式的`JS`对象，例如：
```
const obj = {
    tag:'div',
    attrs:{
        className:"test"
    },
    children:[
    tag:'span',
    attrs:{
        className:"text"
    },
    tag:'p',
    attrs:{
        className:"p"
    },
    ]
    
}

```

### 怎么生成对应的虚拟`DOM`对象？

* 先把代码变成抽象语法树（`AST`）
* 然后进行对应的处理
* 输出成浏览器可以识别的代码-即`js`对象

> 这一切都是基于`Babel`做的  [babel在线编译测试](https://www.babeljs.cn/repl#?babili=false&browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=MYGwhgzhAECCAO9oFMAeAXZA7AJjASsmMOgHQDCA9gLbyVbboDeAUAJABO2OyHAFAEpW0EdC7oArhyzQAPDgCWANwB8ARgBMAZlkB6RapajoAXxZmWQA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=es2015%2Creact%2Cstage-2&prettier=false&targets=&version=7.5.5)

```
class App extends React.Component{
	render(){
    return <div>123</div>
    }
}

```

上面这段代码 会被编译成:
```
...
  _createClass(App, [{
    key: "render",
    value: function render() {
      return React.createElement("div", null, "123");
    }
  }]);

//省略掉一部分代码
```

最核心的一段`jsx`代码,` return <div>123</div>`被转换成了：`return React.createElement("div", null, "123");`

### 最重要的开始点：
我们写的`jsx`代码，都会被转换成`React.createElement`这种形式

那我们只要自己一个`React`全局对象，给它挂载这个`React.createElement`方法就可以进行接下来的处理：
```
const React = {};
React.createElement = function(tag, attrs, ...children) {
  return {
    tag,
    attrs,
    children
  };
};
export default React;

```

我们定义的`React.createElement`方法也很简单，只是把对应的参数集中变成一个特定格式的对象，然后返回，再接下来进行处理～。`Babel`的配置会帮我们自动把`jsx`转换成`React.creatElement`的代码,参数都会默认帮我们传好～

> 构建工具我们使用零配置的`parcel` ,相比`webpack`来说，更容易上手，当然对于一个把`webpack`玩透了的人来说，其实用什么都一样～

* `npm install -g parcel-bundler`
* `parcel index.html`即可运行项目
```
// .babelrc 配置
{
    "presets": ["env"],
    "plugins": [
        ["transform-react-jsx", {
            "pragma": "React.createElement"
        }]
    ]
}

```

### 处理好了`jsx`代码，我们入口开始写起：

* `ReactDOM.render`方法是我们的入口 
* 先定义`ReactDOM`对象，以及它的`render`方法～
```
const ReactDom = {};
//vnode 虚拟dom，即js对象 
//container 即对应的根标签 包裹元素
const render = function(vnode, container) {
  return container.appendChild(_render(vnode));
};
ReactDom.render = render;


```

> 思路： 先把虚拟`dom`对象-`js`对象变成真实`dom`对象，然后插入到根标签内。

`_render`方法，接受虚拟`dom`对象，返回真实`dom`对象：

如果传入的是null,字符串或者数字 那么直接转换成真实`dom`然后返回就可以了～
```

  if (vnode === undefined || vnode === null || typeof vnode === 'boolean')
    vnode = '';

  if (typeof vnode === 'number') vnode = String(vnode);

  if (typeof vnode === 'string') {
    let textNode = document.createTextNode(vnode);
    return textNode;
  }
 const dom = document.createElement(vnode.tag);
 return dom 

```

但是有可能传入的是个`div`标签，而且它有属性。那么需要处理属性，由于这个处理属性的函数需要大量复用，我们单独定义成一个函数：
```
  if (vnode.attrs) {
    Object.keys(vnode.attrs).forEach(key => {
      const value = vnode.attrs[key];
      handleAttrs(dom, key, value);
    });
  }
  
  function setAttribute(dom, name, value) {
  if (name === 'className') name = 'class';
  if (/on\w+/.test(name)) {
    name = name.toLowerCase();
    dom[name] = value || '';
  } else if (name === 'style') {
    if (!value || typeof value === 'string') {
      dom.style.cssText = value || '';
    } else if (value && typeof value === 'object') {
      for (let name in value) {
        dom.style[name] =
          typeof value[name] === 'number' ? value[name] + 'px' : value[name];
      }
    }
  } else {
    if (name in dom) {
      dom[name] = value || '';
    }
    if (value) {
      dom.setAttribute(name, value);
    } else {
      dom.removeAttribute(name);
    }
  }
}

  
```

但是可能有子节点的嵌套，于是要用到递归：

```
  vnode.children && vnode.children.forEach(child => render(child, dom)); 
  // 递归渲染子节点

```

> 上面没有考虑到组件，只考虑到了`div`或者字符串数字之类的虚拟`dom`.

其实加入组件也很简单：加入新一个新的处理方式:

我们先定义好`Component`这个类，并且挂载到全局`React`的对象上


```
export class Component {
  constuctor(props = {}) {
    this.state = {};
    this.props = props;
  }
  setState(stateChange) {
    // 将修改合并到state
    console.log('setstate');
    const newState = Object.assign(this.state, stateChange);
    console.log('state:', newState);
    renderComponent(this);
  }
}
....

//挂载Component类到全局React上
React.Component = Component 

```
如果是组件，`Babel`会帮我们把第一个参数变成`function`
```
 if (typeof vnode.tag === 'function') {
    //先创建组件
    const component = createComponent(vnode.tag, vnode.attrs);
    //设置属性
    setComponentProps(component, vnode.attrs)
    //返回的是真实dom对象
    return component.base;
  }


```
`createComponent`和`setComponentProps`都是我们自己定义的方法～后期大量复用


```
export function createComponent(component, props) {
  let inst;
  // 如果是类定义组件，则直接返回实例
  if (component.prototype && component.prototype.render) {
    inst = new component(props);
    // 如果是函数定义组件，则将其扩展为类定义组件
  } else {
    inst = new Component(props);
    inst.constructor = component;
    inst.render = function() {
      return this.constructor(props);
    };
  }

  return inst;
}

```

```
export function setComponentProps(component, props) {
  if (!component.base) {
    if (component.componentWillMount) component.componentWillMount();
  } else if (component.base && component.componentWillReceiveProps) {
    component.componentWillReceiveProps(props);
  }

  component.props = props;

  renderComponent(component);
}

```

`renderComponent`也是我们自己定义的方法，用来渲染组件：

```
export function renderComponent(component) {
  console.log('renderComponent');
  let base;

  const renderer = component.render();

  if (component.base && component.componentWillUpdate) {
    component.componentWillUpdate();
  }

  base = _render(renderer);

  if (component.base) {
    if (component.componentDidUpdate) component.componentDidUpdate();
  } else {
    component.base = base;
    component.componentDidMount && component.componentDidMount();
    if (component.base && component.base.parentNode) {
      component.base.parentNode.replaceChild(base, component.base);
    }
    return;
  }
  if (component.base && component.base.parentNode) {
    component.base.parentNode.replaceChild(base, component.base);
  }
  //base是真实dom对象
  //component.base是将本次渲染好的dom对象挂载到组件上，方便判断是否首次挂载
  component.base = base;
  //互相饮用，方便后期的队列处理
  base._component = component;
}
```
 
 ![图片描述][2]
> 最简单的版本已经完成，对应的生命简单周期做了粗糙处理，但是没有加入`diff`算法和异步`setState`,欢迎移步`gitHub`点个`star`

[最简单版React-无diff算法和异步state,选择master分支](https://github.com/JinJieTan/mini-react)
![](https://user-gold-cdn.xitu.io/2019/8/11/16c7e59e663660e2?w=2048&h=1216&f=png&s=326372)


### 加入`diff`算法和`shouldComponentUpdate`生命周期优化： 


 ![图片描述][3]

没有diff算法，更新`state`后是所有的节点都要更新，这样性能损耗非常大。现在我们开始加入`React`的`diff`算法

首先改造`renderComponent`方法

```
 function renderComponent(component, newState = {}) {

  console.log('renderComponent');
  //真实dom对象
  let base;
  //虚拟dom对象
  const renderer = component.render();
  //component.base是为了表示是否经过初次渲染，好进行生命周期函数调用
  if (component.base && component.componentWillUpdate) {
    component.componentWillUpdate();
  }

  if (component.base && component.shouldComponentUpdate) {
    //如果组件经过了初次渲染，是更新阶段，那么可以根据这个生命周期判断是否更新
    let result = true;
    result =
      component.shouldComponentUpdate &&
      component.shouldComponentUpdate((component.props = {}), newState);
    if (!result) {
      return;
    }
  }
  
  //得到diff算法对比后的真实dom对象
  base = diffNode(component.base, renderer);

  if (component.base) {
    if (component.componentDidUpdate) component.componentDidUpdate();
  } else {
  //为了防止死循环，调用完`didMount`函数就结束。
    component.base = base;
    base._component = component;
    component.componentDidMount && component.componentDidMount();
    return;
  }
  component.base = base;
  base._component = component;
}


```


> 注意，我们是跟`preact`一样，将真实`dom`对象和虚拟`dom`对象进行对比：

分为下面几种diff:
* `Node`节点`diff`
* `Component`组件`diff`
* 属性`diff`
* 纯文本或者数字的`diff`...
* 子节点的`diff`（这个最复杂）

纯文本或者数字的`diff`:

> 纯文本和数字之类的直接替换掉`dom`节点的`textContent`即可

```
diffNode(dom, vnode) {
  let out = dom;

  if (vnode === undefined || vnode === null || typeof vnode === 'boolean')
    vnode = '';

  if (typeof vnode === 'number') vnode = String(vnode);

  // diff text node
  if (typeof vnode === 'string') {
    // 如果当前的DOM就是文本节点，则直接更新内容
    if (dom && dom.nodeType === 3) {
      // nodeType: https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
      if (dom.textContent !== vnode) {
        dom.textContent = vnode;
      }
      // 如果DOM不是文本节点，则新建一个文本节点DOM，并移除掉原来的
    } else {
      out = document.createTextNode(vnode);
      if (dom && dom.parentNode) {
        dom.parentNode.replaceChild(out, dom);
      }
    }

    return out;
  }


```

`Component`组件`diff`

如果不是一个类型组件直接替换掉，否则只更新属性即可
```
function diffComponent(dom, vnode) {
  let c = dom && dom._component;
  let oldDom = dom;

  // 如果组件类型没有变化，则重新set props
  if (c && c.constructor === vnode.tag) {
    setComponentProps(c, vnode.attrs);
    dom = c.base;
    // 如果组件类型变化，则移除掉原来组件，并渲染新的组件
  } else {
    if (c) {
      unmountComponent(c);
      oldDom = null;
    }

    c = createComponent(vnode.tag, vnode.attrs);

    setComponentProps(c, vnode.attrs);
    dom = c.base;

    if (oldDom && dom !== oldDom) {
      oldDom._component = null;
      removeNode(oldDom);
    }
  }

  return dom;
}
```


属性的`diff`

```
export function diffAttributes(dom, vnode) {
  const old = {}; // 当前DOM的属性
  const attrs = vnode.attrs; // 虚拟DOM的属性

  for (let i = 0; i < dom.attributes.length; i++) {
    const attr = dom.attributes[i];
    old[attr.name] = attr.value;
  }

  // 如果原来的属性不在新的属性当中，则将其移除掉（属性值设为undefined）
  for (let name in old) {
    if (!(name in attrs)) {
      handleAttrs(dom, name, undefined);
    }
  }

  // 更新新的属性值
  for (let name in attrs) {
    if (old[name] !== attrs[name]) {
      handleAttrs(dom, name, attrs[name]);
    }
  }
}
```

`children`的`diff`

```

function diffChildren(dom, vchildren) {
  const domChildren = dom.childNodes;
  //没有key值的真实dom集合
  const children = [];
  //有key值的集合 
  const keyed = {};

  if (domChildren.length > 0) {
    for (let i = 0; i < domChildren.length; i++) {
      const child = domChildren[i];
      const key = child.key;
      if (key) {
        keyed[key] = child;
      } else {
        children.push(child);
      }
    }
  }

  if (vchildren && vchildren.length > 0) {
    let min = 0;
    let childrenLen = children.length;

    for (let i = 0; i < vchildren.length; i++) {
      const vchild = vchildren[i];
      const key = vchild.key;
      let child;

      if (key) {
        if (keyed[key]) {
          child = keyed[key];
          keyed[key] = undefined;
        }
      } else if (min < childrenLen) {
        for (let j = min; j < childrenLen; j++) {
          let c = children[j];

          if (c && isSameNodeType(c, vchild)) {
            child = c;
            children[j] = undefined;

            if (j === childrenLen - 1) childrenLen--;
            if (j === min) min++;
            break;
          }
        }
      }

      child = diffNode(child, vchild);

      const f = domChildren[i];
      if (child && child !== dom && child !== f) {
        if (!f) {
          dom.appendChild(child);
        } else if (child === f.nextSibling) {
          removeNode(f);
        } else {
          dom.insertBefore(child, f);
        }
      }
    }
  }
}

```

`children`的`diff`这段，确实看起来不那么简单，总结两点精髓：
* 利用`key`值将节点分成两个队列
* 先对比有`key`值的节点，然后对比相同类型的节点，然后进行`dom`操作


`shouldComponentUpdate`的对比优化： 

```
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.test > 5) {
      console.log('shouldComponentUpdate中限制了更新')
      alert('shouldComponentUpdate中限制了更新')
      return false;
    }
    return true;
  }

```
效果：
 ![图片描述][4]


建议去仓库看完整源码认真斟酌：
[带diff算法版mini-React,选择diff分支](https://github.com/JinJieTan/mini-react/blob/diff/reactDom/diff.js)


看加入了`diff`算法后的效果


 ![图片描述][5]

当然`state`更新后，只是更新了对应的节点，所谓的`diff`算法，就是将真实`dom`和虚拟`dom`对比后，直接`dom`操作。操作那些有更新的节点～ 当然也有直接对比两个虚拟`dom`对象，然后打补丁上去～我们这种方式如果做`SSR`同构就不行，因为我们服务端没`dom`对象这个说法，无法运行～ 

> 这段`diff`是有点硬核，但是去仓库认真看看，自己尝试写写，也是可以啃下来的。



### 异步合并更新`state`版


 ![图片描述][6]

上面的版本，每次setState都会更新组件，这样很不友好，因为有可能一个操作会带来很多个setState，而且很可能会频繁更新state。为了优化性能，我们把这些操作都放在一帧内去操作～ 


 ![图片描述][7]
这里我们使用`requestAnimationFrame`，去执行合并操作～

首先更新`setState`入口，不要直接重新渲染组件：

```

import { _render } from '../reactDom/index';
import { enqueueSetState } from './setState';
export class Component {
  constuctor(props = {}) {
    this.state = {};
    this.props = props;
  }
  setState(stateChange) {
    // 将修改合并到state
    console.log('setstate');
    const newState = Object.assign(this.state, stateChange);
    console.log('state:', newState);
    this.newState = newState;
    enqueueSetState(newState, this);
  }
}

```

`enqueueSetState`是我们的一个入口函数：

```
function enqueueSetState(stateChange, component) {
  if (setStateQueue.length === 0) {
    //清空队列的办法是异步执行,下面都是同步执行的一些计算
    defer(flush);
  }

  //向队列中添加对象 key:stateChange value:component
  setStateQueue.push({
    stateChange,
    component
  });

  //如果渲染队列中没有这个组件 那么添加进去
  if (!renderQueue.some(item => item === component)) {
    renderQueue.push(component);
  }
}

```
上面代码的精髓：
* 先执行同步代码
* 首次`setState`调用进入`if (setStateQueue.length === 0) `的判断
* 异步在下一帧执行`flush`函数
* 同步执行`setStateQueue.push`
* 同步执行`  renderQueue.push(component)`
* 最后执行`defer`函数

`defer`函数
```
function defer(fn) {
  //requestIdleCallback的兼容性不好，对于用户交互频繁多次合并更新来说
  ，requestAnimation更有及时性高优先级，requestIdleCallback则适合处理可以延迟渲染的任务～
  //   if (window.requestIdleCallback) {
  //     console.log('requestIdleCallback');
  //     return requestIdleCallback(fn);
  //   }
  //高优先级任务
  return requestAnimationFrame(fn);
}
```

思考了很久，决定还是用`requestAnimationFrame`,为了体现界面交互的及时性

`flush`清空队列的函数：

```
function flush() {
  let item, component;
  //依次取出对象，执行
  while ((item = setStateQueue.shift())) {
    const { stateChange, component } = item;

    // 如果没有prevState，则将当前的state作为初始的prevState
    if (!component.prevState) {
      component.prevState = Object.assign({}, component.state);
    }

    // 如果stateChange是一个方法，也就是setState的第二种形式
    if (typeof stateChange === 'function') {
      Object.assign(
        component.state,
        stateChange(component.prevState, component.props)
      );
    } else {
      // 如果stateChange是一个对象，则直接合并到setState中
      Object.assign(component.state, stateChange);
    }

    component.prevState = component.state;
  }

  //依次取出组件，执行更新逻辑，渲染
  while ((component = renderQueue.shift())) {
    renderComponent(component);
  }
}
```


`flush`函数的精髓：

* 抽象队列，一个是对应的改变`state`和组件的队列， 一个是需要更新的组件队列
* 每一帧就清空当前`setState`队列的需要更新的组件，一次性合并清空


完整代码仓库地址，欢迎`star`：
[带diff算法和异步state的minj-react](https://github.com/JinJieTan/mini-react/tree/diff-async)


### 上面是`V15`版本的`stack`递归`diff`版本的`React`实现：

当我们有100个节点需要更新的时候，我们正在递归对比节点，此时用户点击界面需要弹框，那么可能会造成延迟弹出窗口，根据`RAID`,超过`100ms`，用户就会感觉明显卡顿。为了防止出现这种情况，我们需要改变整体的`diff`策略。把递归的对比，改成可以暂停执行的循环对比，这样如果即时我们在对比阶段，有用户点击需要交互的时候，我们可以暂停对比，处理用户交互。


> 上面这段话，说的就是`stack`版本和`Fiber`架构的区别。


`stack`版本就是我们上面的版本 



### `Fiber`版本： 

思路： 

* 将对比阶段分割成一个个小任务
* 采用两个虚拟`dom`对象的去`diff`对比方式，单链表结构，三根指针，`return children sibling`。
* 每帧完成一个小任务，然后去执行`requestAnimationFrame`,如果还有时间，那么就去执行`requestIdleCallback`.




> 这个版本暂时就结束了哦～ 欢迎加入我们的前端交流群，还有前往`gitHub`给个`star`。


本人参考：
[hujiulong的博客](https://github.com/hujiulong/blog)，感谢这些大佬的无私开源


前端交流群：
 现在人数超过了100人，所以只能加我，然后拉你们进群！！



![clipboard.png](/img/bVbwnjl)
 

> 另外深圳招收跨平台开发`Electron+React`的即时通讯产品前端工程师

欢迎投递： `453089136@qq.com ` - `Peter`

招收中级和高级各一名～团队氛围`nice` 不加班 


  [1]: /img/bVbwfRh
  [2]: /img/bVbwfRq
  [3]: /img/bVbwfRN
  [4]: /img/bVbwfRP
  [5]: /img/bVbwfRW
  [6]: /img/bVbwfR3
  [7]: /img/bVbwfR9
  [8]: /img/bVbwfSn

