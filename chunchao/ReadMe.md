#### 欢迎来到pangu微前端框架

* 乞丐版，仅仅能跑

#### 启用流程

* git clone https://github.com/JinJieTan/chunchao.git

* cd chunchao 

* yarn global add parcel-bundler

* yarn 

* yarn startSubApp1

* yarn startSubApp2 

* yarn start:main 

* 访问浏览器：http://localhost:1234/

> 恭喜你已经开启了chunchao的第一步了～

#### 接下来会做什么

* 完善微前端功能

* 支持IE11

* 持续更新...

欢迎加我的微信：CALASFxiaotan  

记得备注：微前端进群交流



![](https://mmbiz.qpic.cn/mmbiz_jpg/iawKicic66ubH6Lwia281libMTY973unpNeZg2afBcfw9KIqic38xVLnjnCDRdia2rFFPJxIyzF9muWkP8x9icW4s8pTew/640?wx_fmt=jpeg)

  

写在开头：

  

手写框架体系文章，缺手写vue和微前端框架文章，今日补上微前端框架，觉得写得不错，记得点个关注+在看，转发更好  

  

* * *

  

对源码有兴趣的，可以看我之前的系列手写源码文章

  

[微前端框架是怎么导入加载子应用的  【3000字精读】](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484853&idx=1&sn=52837357ca279ed281088fa00f04aea9&chksm=ea940746dde38e50c3cb913ce099a3954f2df449d74aee67c150e194bd7a574fc5f5bf071a2f&scene=21#wechat_redirect)  

  

[原创：带你从零看清Node源码createServer和负载均衡整个过程](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484478&idx=2&sn=e9f6c448d86f4893c2305debe2dfe5fa&chksm=ea9406cddde38fdbbdf35b78cf430e9ea8dd8f5ef1d066d5ca0fca560bb83b2dea499d649e9a&scene=21#wechat_redirect)  

  

[原创：从零实现一个简单版React （附源码）](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484632&idx=1&sn=52673659fd89791c981b5858357ab250&chksm=ea94062bdde38f3da63bbece98b7aebfed2f41cf5701dbaa9c60181ab010ee94e18799ec7e39&scene=21#wechat_redirect)

  

[精读:10个案例让你彻底理解React hooks的渲染逻辑](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484881&idx=1&sn=f13ee77a0473c29971edab12d160b528&chksm=ea940722dde38e34d4e79fdda2edaf416f30f797eba14d1dc911882bd904a769522c07147cb0&scene=21#wechat_redirect)  

  

[原创：如何自己实现一个简单的webpack构建工具 【附源码】](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484668&idx=1&sn=ff7f79e507bd9fc5c6777993bfda08d7&chksm=ea94060fdde38f199f04e1f0db134f836c88b19b1ddae01f7d5003361e0dd11dad1c5e1fb176&scene=21#wechat_redirect)  

  

[从零解析webRTC.io Server端源码](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484824&idx=2&sn=21c3e938db06881d9f6266254c164162&chksm=ea94076bdde38e7da252ef83d0659601491ef1cd146cc006637d043f61ea2fd101a7bcab2fee&scene=21#wechat_redirect)  

  

* * *

  

正式开始：  
  

对于微前端，最近好像很火，之前我公众号也发过比较多微前端框架文章

  

[深度：微前端在企业级应用中的实践  (1万字，华为)](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484761&idx=1&sn=c5691a1de59fa6d5279128c87e577b54&chksm=ea9407aadde38ebc1ec518fd1a52a86b23cc76df985d554899d702f870f80ca8060b0d8d0bd5&scene=21#wechat_redirect)  

  

[万字解析微前端、微前端框架qiankun以及源码](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484752&idx=1&sn=70c99fbfe8ad16a3ed4ccfd3f6585c15&chksm=ea9407a3dde38eb546f6cd95d5f1d0378f6e1da30a340fb386b15c79400e7b714cd50faee25e&scene=21#wechat_redirect)  

  

那么现在我们需要手写一个微前端框架，首先得让大家知道什么是微前端，现在微前端模式分很多种，但是大都是一个基座+多个子应用模式，根据子应用注册的规则，去展示子应用。  

  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH7VvthFvdicYaIHfQglhibPJqDs00Vq47qqATicIaMJQEnPPl2mpQVGRKNJVOzJ6DiaLhVPVEnnMKXxKw/640?wx_fmt=png)

  

这是目前的微前端框架基座加载模式的原理，基于single-spa封装了一层，我看有不少公司是用Vue做加载器（有天然的keep-alive），还有用angular和web components技术融合的

  

* * *

  

首先项目基座搭建,这里使用**parcel**：

  

```
mkdir pangu 
yarn init 
//输入一系列信息
yarn add parcel@next
```

  

然后新建一个index.html文件，作为基座

  

```

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
```

  

新建一个index.js文件，作为基座加载配置文件

  

新建src文件夹，作为pangu框架的源码文件夹,

  

新建example案例文件夹

  

现在项目结构长这样  

  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6Lwia281libMTY973unpNeZgsic6KvLgj543ib6GLVEialmAhRg2roAooTvygc6oGSNEBJYRrPz6icBzUw/640?wx_fmt=png)

  

* * *

  

既然是手写，就不依赖其他任何第三方库

  

我们首先需要重写hashchange popstate这两个事件，因为微前端的基座，需要监听这两个事件根据注册规则去加载不同的子应用，而且它的实现必须在React、vue子应用路由组件切换之前，单页面的路由源码原理实现，其实也是靠这两个事件实现，**之前我写过一篇单页面实现原理的文章，不熟悉的可以去看看**  

```
https://segmentfault.com/a/1190000019936510
```

  

```

const HIJACK_EVENTS_NAME = /^(hashchange|popstate)$/i;
const EVENTS_POOL = {
  hashchange: [],
  popstate: [],
};

window.addEventListener('hashchange', loadApps);
window.addEventListener('popstate', loadApps);

const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
window.addEventListener = function (eventName, handler) {
  if (
    eventName &&
    HIJACK_EVENTS_NAME.test(eventName) &&
    typeof handler === 'function'
  ) {
    EVENTS_POOL[eventName].indexOf(handler) === -1 &&
      EVENTS_POOL[eventName].push(handler);
  }
  return originalAddEventListener.apply(this, arguments);
};
window.removeEventListener = function (eventName, handler) {
  if (eventName && HIJACK_EVENTS_NAME.test(eventName)) {
    let eventsList = EVENTS_POOL[eventName];
    eventsList.indexOf(handler) > -1 &&
      (EVENTS_POOL[eventName] = eventsList.filter((fn) => fn !== handler));
  }
  return originalRemoveEventListener.apply(this, arguments);
};

function mockPopStateEvent(state) {
  return new PopStateEvent('popstate', { state });
}

// 拦截history的方法，因为pushState和replaceState方法并不会触发onpopstate事件，所以我们即便在onpopstate时执行了reroute方法，也要在这里执行下reroute方法。
const originalPushState = window.history.pushState;
const originalReplaceState = window.history.replaceState;
window.history.pushState = function (state, title, url) {
  let result = originalPushState.apply(this, arguments);
  reroute(mockPopStateEvent(state));
  return result;
};
window.history.replaceState = function (state, title, url) {
  let result = originalReplaceState.apply(this, arguments);
  reroute(mockPopStateEvent(state));
  return result;
};

// 再执行完load、mount、unmout操作后，执行此函数，就可以保证微前端的逻辑总是第一个执行。然后App中的Vue或React相关Router就可以收到Location的事件了。
export function callCapturedEvents(eventArgs) {
  if (!eventArgs) {
    return;
  }
  if (!Array.isArray(eventArgs)) {
    eventArgs = [eventArgs];
  }
  let name = eventArgs[0].type;
  if (!HIJACK_EVENTS_NAME.test(name)) {
    return;
  }
  EVENTS_POOL[name].forEach((handler) => handler.apply(window, eventArgs));
}
```

  

上面代码很简单，创建两个队列，使用数组实现  

```

const EVENTS_POOL = {
  hashchange: [],
  popstate: [],
};

```

  

如果检测到是hashchange popstate两种事件，而且它们对应的回调函数不存在队列中时候，那么就放入队列中。（相当于redux中间件原理）

  

然后每次监听到路由变化，调用reroute函数:  
  

```
function reroute() {
  invoke([], arguments);
}
```

  

**这样每次路由切换，最先知道变化的是基座，等基座同步执行完（阻塞）后，就可以由子应用的vue-Rourer或者react-router-dom等库去接管实现单页面逻辑了。**  

  

* * *

  

那，路由变化，怎么加载子应用呢？

  

像一些微前端框架会用import-html之类的这些库，我们还是手写吧  

  

逻辑大概是这样，一共四个端口，nginx反向代理命中基座服务器监听的端口（用户必须首先访问到根据域名），然后去不同子应用下的服务器拉取静态资源然后加载。

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6Lwia281libMTY973unpNeZgsHYaTXJXUOYLQL0nKwmrl9ane8cicib73yG8uAXiasdOd60DIibib4CmRibw/640?wx_fmt=png)

* * *

  

提示：所有子应用加载后，只是在基座的一个div标签中加载，实现原理跟ReactDom.render()这个源码一样，可参考我之前的文章

  

[原创：从零实现一个简单版React （附源码）](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484632&idx=1&sn=52673659fd89791c981b5858357ab250&chksm=ea94062bdde38f3da63bbece98b7aebfed2f41cf5701dbaa9c60181ab010ee94e18799ec7e39&scene=21#wechat_redirect)  

  

* * *

  

那么我们先编写一个**registrApp**方法，接受一个entry参数，然后去根据url变化加载子应用（传入的第二个参数**activeRule**）

  

```

/**
 *
 * @param {string} entry
 * @param {string} function
 */
const Apps = [] //子应用队列
function registryApp(entry,activeRule) {
    Apps.push({
        entry,
        activeRule
    })
}
```

  

注册完了之后，就要找到需要加载的app  

  

```
export async function loadApp() {
  const shouldMountApp = Apps.filter(shouldBeActive);
  console.log(shouldMountApp, 'shouldMountApp');
  //   const res = await axios.get(shouldMountApp.entry);
  fetch(shouldMountApp.entry)
    .then(function (response) {
      return response.json();
    })
    .then(function (myJson) {
      console.log(myJson, 'myJson');
    });
}
```

  

shouldBeActive根据传入的规则去判断是否需要此时挂载:

  

```
export function shouldBeActive(app){
    return app.activeRule(window.location)
}
```

  

此时的res数据，就是我们通过get请求获取到的子应用相关数据,现在我们新增subapp1和subapp2文件夹，模拟部署的子应用，我们把它用静态资源服务器跑起来

  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6Lwia281libMTY973unpNeZgAbXH6k0JMOrZsTs4r3K2UClp7Lrv52U8juIJwlppc10pg0Mtqc4bkw/640?wx_fmt=png)

  

subapp1.js作为subapp1的静态资源服务器

  

```
const express = require('express');
```

  

subapp2.js作为subapp2的静态资源服务器

  

```

const express = require('express');
const app = express();
const { resolve } = require('path');
app.use(express.static(resolve(__dirname, '../subapp1')));

app.listen(8889, (err) => {
  !err && console.log('8889端口成功');
});
```

  

现在文件目录长这样：

  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6Lwia281libMTY973unpNeZghNdBhKeeCu155Ws5cwZWSehl39upvCMicQIjfeQAJJR0jsTYia1RZjibQ/640?wx_fmt=png)

  

基座index.html运行在1234端口，subapp1部署在8889端口，subapp2部署在8890端口，这样我们从基座去拉取资源时候，就会跨域，所以静态资源服务器、webpack热更新服务器等服务器，都要加上cors头，允许跨域。

  

```

const express = require('express');
const app = express();
const { resolve } = require('path');
//设置跨域访问
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', ' 3.2.1');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});
app.use(express.static(resolve(__dirname, '../subapp1')));

app.listen(8889, (err) => {
  !err && console.log('8889端口成功');
});

```

  

⚠️：如果是dev模式，记得在webpack的热更新服务器中配置允许跨域，如果你对webpack不是很熟悉，可以看我之前的文章:

  

[万字硬核     从零实现webpack热更新HMR](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484088&idx=1&sn=62fe4c792437024cb07d946274c9db32&chksm=ea94004bdde3895d68c6c09883e3197654a7c909fabc912909af1f4617527c19441ee2db04c8&scene=21#wechat_redirect)  

  

[原创：如何自己实现一个简单的webpack构建工具 【附源码】](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484668&idx=1&sn=ff7f79e507bd9fc5c6777993bfda08d7&chksm=ea94060fdde38f199f04e1f0db134f836c88b19b1ddae01f7d5003361e0dd11dad1c5e1fb176&scene=21#wechat_redirect)

  

* * *

  

这里我使用nodemon启用静态资源服务器，简单为主，如果你没有下载，可以:

  

```
npm i nodemon -g 
或
yarn add nodemon global 
```

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6Lwia281libMTY973unpNeZgj5ibdwVic9E4ZZbORuCOneSwLm0o3xRviaDCgVPgwSbFutJhjAHerfVBw/640?wx_fmt=png)

  

这样我们先访问下8889,8890端口，看是否能访问到。

  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6Lwia281libMTY973unpNeZgMqic0mI7O1DPuCFxoOxpkwlzVgCBibL9IBNA6QOLOaIHRKic3zXvHicgXw/640?wx_fmt=png)

访问8889和8890都可以访问到对应的资源，成功

  

* * *

  

正式开启启用我们的微前端框架pangu.封装start方法，启用需要挂载的APP。

  

```

export function start(){
    loadApp()
}
```

  

注册子应用subapp1,subapp2,并且手动启用微前端

  

```

import { registryApp, start } from './src/index';
registryApp('localhost:8889', (location) => location.pathname === '/subapp1');
registryApp('localhost:8890', (location) => location.pathname === '/subapp2');
start()
```

  

修改index.html文件:  
  

```

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div>
        <h1>基座</h1>
        <div class="subapp">
            <div>
                <a href="/subapp1">子应用1</a>
            </div>
            <div>
                <a href="/subapp2">子应用2</a>
            </div>
        </div>
        <div id="subApp"></div>
    </div>
</body>
<script src="./index.js"></script>

</html>
```

  

ok，运行代码，发现挂了，为什么会挂呢？因为那边返回的是html文件，我这里用的**fetch**请求，**JSON**解析不了

  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6Lwia281libMTY973unpNeZg9ny7Jb8ia7L9EzVOCXF5iaabiav0icUtRzB1cic9AgEvCM0npf54hwjx6Fg/640?wx_fmt=png)

  

那么我们去看看别人的微前端和第三方库的源码吧,例如import-html-entry这个库

  

由于之前我解析过qiankun这个微前端框架源码，我这里就不做过度讲解，它们是对fetch做了一个text()。

```

export async function loadApp() {
  const shouldMountApp = Apps.filter(shouldBeActive);
  console.log(shouldMountApp, 'shouldMountApp');
  //   const res = await axios.get(shouldMountApp.entry);
  fetch(shouldMountApp.entry)
    .then(function (response) {
      return response.text();
    })
    .then(function (myJson) {
      console.log(myJson, 'myJson');
    });
}

```

  

然后我们已经可以得到拉取回来的html文件了（此时是一个字符串）  

  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6Lwia281libMTY973unpNeZgDosCjrbw7k8R41GuvL8lrw0yLwgRWwayv6B6zoo4hBxibvMhcp2nsfA/640?wx_fmt=png)

  

由于现实的项目，一般这个html文件会包含js和css的引入标签，也就是我们目前的单页面项目，类似下面这样：  

  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6Lwia281libMTY973unpNeZgGsV4dbveY8QYahYomwUeDRK4B1xLkhIbpLK1gCr5KN8sqQVEBk0stA/640?wx_fmt=png)

  

于是我们需要把脚本、样式、html文件分离出来。用一个对象存储

  

本想照搬某个微前端框架源码的，但是觉得它写得也就那样，今天又主要讲原理，还是自己写一个能跑的把，毕竟html的文件都回来了，数据处理也不难  

  

```
export async function loadApp() {
  const shouldMountApp = Apps.filter(shouldBeActive);
  console.log(shouldMountApp, 'shouldMountApp');
  //   const res = await axios.get(shouldMountApp.entry);
  fetch(shouldMountApp[0].entry)
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      const dom = document.createElement('div');
      dom.innerHTML = text;
      console.log(dom, 'dom');
    });
}
```

  

先改造下，打印下DOM

  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6Lwia281libMTY973unpNeZgKibCia7iaHXiaDN34Zw5U73YicUd7EyDCLbWFbOv3Jrb0eNmX1J0h5537QQ/640?wx_fmt=png)

  

发现已经能拿到dom节点了，那么我先处理下，让它展示在基座中

  

```

export async function loadApp() {
  const shouldMountApp = Apps.filter(shouldBeActive);
  console.log(shouldMountApp, 'shouldMountApp');
  //   const res = await axios.get(shouldMountApp.entry);
  fetch(shouldMountApp[0].entry)
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      const dom = document.createElement('div');
      dom.innerHTML = text;
      const content = dom.querySelector('h1');
      const subapp = document.querySelector('#subApp-content');
      subapp && subapp.appendChild(content);
    });
}
```

  

此时，我们已经可以加载不同的子应用了。

  

![](https://mmbiz.qpic.cn/mmbiz_gif/iawKicic66ubH6Lwia281libMTY973unpNeZgeM1SiaWiaxPDXnowOf33GboaQNFrxDH2CxDl6Nib3vnnP4NRw5iaafMIlw/640?wx_fmt=gif)

乞丐版的微前端框架就完成了，后面会逐步完善所有功能,向主流的微前端框架靠拢，并且完美支持IE11.记住它叫:**pangu**

  

**推荐阅读之前的手写ws协议：**

  

[深度：手写一个WebSocket协议    \[7000字\]](http://mp.weixin.qq.com/s?__biz=MzI2NTk2NzUxNg==&mid=2247484914&idx=1&sn=8afc09e915c2d1cfc79bb7f27f838ea2&chksm=ea940701dde38e1768e3408a86b3f44c74e9ad793a49a330648b6b2648ed9aed900fe1de34fa&scene=21#wechat_redirect)

### 最后

  

  

*   欢迎加我微信(CALASFxiaotan)，拉你进技术群，长期交流学习...
    
*   欢迎关注「前端巅峰」,认真学前端，做个有专业的技术人...
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZUCR5WEela9H9fDfYic8BAp8ib4cmuicFgACoRwORYGwkBtgUVaILLOjXtlGBnicuM5246MgketktMCg/640?wx_fmt=png)

点个赞支持我吧，转发就更好了