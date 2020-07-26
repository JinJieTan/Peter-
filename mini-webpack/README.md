![clipboard.png](/img/bVbxdnB)

如果对`React`技术栈感兴趣的你，可以去阅读我的前面两篇文章：

[从零自己实现一个mini-React框架][1]


[从零搭建一个React优化版脚手架][2]

`GitHub`上面都有对应的源码哦～ 欢迎`Star`

 
本项目在`Github`上的源码地址： [mini-webpack][3]



`webpack`可以说是目前最火的打包工具，如果用不好他，真的不敢说自己是个合格的前端工程师～


本文会先介绍`webpack`的打包流程，运行原理，然后去实现一个简单的`webpack`。


![clipboard.png](/img/bVbxccc)

本质上，`webpack` 是一个现代 `JavaScript` 应用程序的静态模块打包器(module bundler)。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图(`dependency graph`)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 `bundle`。


###webpack打包过程

1.识别入口文件

2.通过逐层识别模块依赖。（Commonjs、amd或者es6的import，webpack都会对其进行分析。来获取代码的依赖）

3.webpack做的就是分析代码。转换代码，编译代码，输出代码

4.最终形成打包后的代码


###webpack打包原理

1.先逐级递归识别依赖，构建依赖图谱

2.将代码转化成`AST`抽象语法树 

下图是一个抽象语法树：

![clipboard.png](/img/bVbxccB)
]

3.在`AST`阶段中去处理代码

4.把`AST`抽象语法树变成浏览器可以识别的代码， 然后输出



###准备工作

在编写自己的构建工具前，需要下载四个包。


1.`@babel/parser`: 分析我们通过 fs.readFileSync 读取的文件内容，返回 AST (抽象语法树)
2.`@babel/traverse`: 可以遍历 AST, 拿到必要的数据
3.`@babel/core`: babel 核心模块，其有个transformFromAst方法，可以将 AST 转化为浏览器可以运行的代码
4.`@babel/preset-env`: 将代码转化成 ES5 代码

使用`yarn`下载：
```
$ yarn init -y 

$ yarn add @babel/parser @babel/traverse @babel/core @babel/preset-env 

```
 
###首先查看如何将最简单的一个文件转换成`AST`

目录结构：


![clipboard.png](/img/bVbxcdm)


代码实现：

```
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default; 
// traverse 采用的 ES Module 导出，我们通过 requier 引入的话就加个 .default
const babel = require('@babel/core');

const read = fileName => {
  const buffer = fs.readFileSync(fileName, 'utf-8');
  const AST = parser.parse(buffer, { sourceType: 'module' });
  console.log(AST);
};
read('./test1.js');



```
上面代码：

1.先用同步的`Node API`读取文件流 

2.再将对应的`buffer`转换成下面的`AST`
```
Node {
  type: 'File',
  start: 0,
  end: 32,
  loc:
   SourceLocation {
     start: Position { line: 1, column: 0 },
     end: Position { line: 1, column: 32 } },
  program:
   Node {
     type: 'Program',
     start: 0,
     end: 32,
     loc: SourceLocation { start: [Position], end: [Position] },
     sourceType: 'module',
     interpreter: null,
     body: [ [Node] ],
     directives: [] },
  comments: [] }

```

我们已经将代码转换成了`AST`语法树，那么还需要遍历`AST`，然后转换成浏览器可以认识的代码

在`read`函数中加入如下代码：

```

// 依赖收集
	const dependencies = {};

	// 使用 traverse 来遍历 AST
	traverse(AST, {
		ImportDeclaration({ node }) { // 函数名是 AST 中包含的内容，参数是一些节点，node 表示这些节点下的子内容
			const dirname = path.dirname(filename); // 我们从抽象语法树里面拿到的路径是相对路径，然后我们要处理它，在 bundler.js 中才能正确使用
			const newDirname = './' + path.join(dirname, node.source.value).replace('\\', '/'); // 将dirname 和 获取到的依赖联合生成绝对路径
			dependencies[node.source.value] = newDirname; // 将源路径和新路径以 key-value 的形式存储起来
		}
	})

	// 将抽象语法树转换成浏览器可以运行的代码
	const { code } = babel.transformFromAst(AST, null, {
		presets: ['@babel/preset-env']
	})

	return {
		filename,
		dependencies,
		code
	}

```
当我们调用`read`函数，读取`test1.js`的内容时：
```
const result = read('./test1.js');
console.log(result);
```
得到打印的输出结果：
```
{ fileName: './test1.js',
  dependencies: {},
  code: '"use strict";\n\nconsole.log(\'this is test1.js \');' }
```

原本`test1.js`的内容是：


![clipboard.png](/img/bVbxceV)

### 正式开始，下面加入`ES6`模块化，重新定义文件目录

![clipboard.png](/img/bVbxch8)

启动文件 `index.js`
```
...//一些的逻辑都在这个文件中，我们只需要传入一个entry入口
```
`app.js`

```
import test1 from './test1.js'
console.log(test1)
```

`test1.js`

```
import test2 from './test2.js';
console.log('this is test1.js ', test2);

```

`test2.js`
```
function test2() {
  console.log('this is test2 ');
}

export default test2;

```

依赖关系非常清楚：
入口是`index.js` - > 依赖`test1.js`依赖 - > `test2.js`

上面仅仅做了一些的处理，如果遇到依赖的文件还有依赖就不行了。


于是我们需要创建一个可以处理依赖关系的函数：


###获取依赖图谱
```
// 创建依赖图谱函数, 递归遍历所有依赖模块
const makeDependenciesGraph = (entry) => {
	const entryModule = read(entry)
	const graghArray = [ entryModule ]; // 首先将我们分析的入口文件结果放入图谱数组中
	for (let i = 0; i < graghArray.length; i ++) {
    const item = graghArray[i];
		const { dependencies } = item; // 拿到当前模块所依赖的模块
		if (dependencies) {
			for ( let j in dependencies ) { // 通过 for-in 遍历对象
				graghArray.push(read(dependencies[j])); // 如果子模块又依赖其它模块，就分析子模块的内容
			}
		}
	}

	const gragh = {}; // 将图谱的数组形式转换成对象形式
	graghArray.forEach( item => {
		gragh[item.filename] = {
			dependencies: item.dependencies,
			code: item.code
		}
  })
  console.log(gragh)
	return gragh;
}

```

打印`gragh`得到的对象：
```
{ './app.js':
   { dependencies: { './test1.js': './test1.js' },
     code:
      '"use strict";\n\nvar _test = _interopRequireDefault(require("./test1.js"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n\nconsole.log(test
1);' },
  './test1.js':
   { dependencies: { './test2.js': './test2.js' },
     code:
      '"use strict";\n\nvar _test = _interopRequireDefault(require("./test2.js"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n\nconsole.log(\'th
is is test1.js \', _test["default"]);' },
  './test2.js':
   { dependencies: {},
     code:
      '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports["default"] = void 0;\n\nfunction test2() {\n  console.log(\'this is test2 \');\n}\n\nvar _default = tes
t2;\nexports["default"] = _default;' } } 
```

此时我们已经获取了所有的依赖，以及依赖的代码内容，只需要处理输出即可

###最终处理代码输出

```

const generateCode = (entry) => {
	// 注意：我们的 gragh 是一个对象，key是我们所有模块的绝对路径，需要通过 JSON.stringify 来转换
	const gragh = JSON.stringify(makeDependenciesGraph(entry));
	// 我们知道，webpack 是将我们的所有模块放在闭包里面执行的，所以我们写一个自执行的函数
	// 注意: 我们生成的代码里面，都是使用的 require 和 exports 来引入导出模块的，而我们的浏览器是不认识的，所以需要构建这样的函数
	return `
		(function( gragh ) {
			function require( module ) {
				// 相对路径转换成绝对路径的方法
				function localRequire(relativePath) {
					return require(gragh[module].dependencies[relativePath])
				}
				const exports = {};
				(function( require, exports, code ) {
					eval(code)
				})( localRequire, exports, gragh[module].code )

				return exports;
			}
			require('${ entry }')
		})(${ gragh })
	`;
}

const code = generateCode('./app.js');

console.log(code)

```

得到编译输出的代码`code`如下:

```
(function( gragh ) {
                        function require( module ) {
                                // 相对路径转换成绝对路径的方法
                                function localRequire(relativePath) {
                                        return require(gragh[module].dependencies[relativePath])
                                }
                                const exports = {};
                                (function( require, exports, code ) {
                                        eval(code)
                                })( localRequire, exports, gragh[module].code )

                                return exports;
                        }
                        require('./app.js')
                })({"./app.js":{"dependencies":{"./test1.js":"./test1.js"},"code":"\"use strict\";\n\nvar _test = _interopRequireDefault(require(\"./test1.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(_test[\"default\"]);"},"./test1.js":{"dependencies":{"./test2.js":"./test2.js"},"code":"\"use strict\";\n\nvar _test = _interopRequireDefault(require(\"./test2.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log('this is test1.js ', _test[\"default\"]);"},"./test2.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nfunction test2() {\n  console.log('this is test2 ');\n}\n\nvar _default = test2;\nexports[\"default\"] = _default;"}})
                ```

复制这段代码到浏览器中运行：

![clipboard.png](/img/bVbxcjM)


代码是可以运行的，`ES6`模块化已经可以被浏览器识别



###模仿`webpack`实现`loader`和`plugin`:

在开头那篇文章有介绍到，`webpack`的`loader`和`plugin`本质：

`loader`本质是对字符串的正则匹配操作 


`plugin`的本质，是依靠`webpack`运行时广播出来的生命周期事件，再调用`Node.js`的`API`利用`webpack`的全局实例对象进行操作，不论是硬盘文件的操作,还是内存中的数据操作。


> `webpack`的核心依赖库： `Tapable`

`tapable`是`webpack`的核心依赖库 想要读懂webpack源码 就必须首先熟悉tapable
```

const {
    SyncHook,
    SyncBailHook,
    SyncWaterfallHook,
    SyncLoopHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesWaterfallHook
 } = require("tapable");
```
这些钩子可分为同步的钩子和异步的钩子，`Sync`开头的都是同步的钩子，`Async`开头的都是异步的钩子。而异步的钩子又可分为并行和串行，其实同步的钩子也可以理解为串行的钩子。


我的理解：

这是一个发布-订阅模式

`webpack`运行时广播出事件，让之前订阅这些事件的订阅者们（其实就是插件）都触发对应的事件，并且拿到全局的`webpack`实例对象，再做一系列的处理，就可以完成很复杂的功能

同步的钩子是串行

异步的钩子分为并行和串行的钩子，并行是指 等待所有并发的异步事件执行之后再执行最终的异步回调。
而串行是值 第一步执行完毕再去执行第二步，以此类推，直到执行完所有回调再去执行最终的异步回调。

拿最简单的同步钩子，`SyncHook`来说

```
const { SyncHook } = require('tapable');

class Hook{
    constructor(){
        /** 1 生成SyncHook实例 */
        this.hooks = new SyncHook(['name']);
    }
    tap(){
        /** 2 注册监听函数 */
        this.hooks.tap('node',function(name){
            console.log('node',name);
        });
        this.hooks.tap('react',function(name){
            console.log('react',name);
        });
    }
    start(){
        /** 3出发监听函数 */
        this.hooks.call('call end.');
    }
}

let h = new Hook();

h.tap();/** 类似订阅 */ 
h.start();/** 类似发布 */

/* 打印顺序：
    node call end.
    react call end.
*/
```
再看一个异步钩子`AsyncParallelHook`

```
const { AsyncParallelHook } = require('tapable');

class Hook{
    constructor(){
        this.hooks = new AsyncParallelHook(['name']);
    }
    tap(){
        /** 异步的注册方法是tapAsync() 
         * 并且有回调函数cb.
        */
        this.hooks.tapAsync('node',function(name,cb){
            setTimeout(()=>{
                console.log('node',name);
                cb();
            },1000);
        });
        this.hooks.tapAsync('react',function(name,cb){
            setTimeout(()=>{
                console.log('react',name);
                cb();
            },1000);
        });
    }
    start(){
        /** 异步的触发方法是callAsync() 
         * 多了一个最终的回调函数 fn.
        */
        this.hooks.callAsync('call end.',function(){
            console.log('最终的回调');
        });
    }
}

let h = new Hook();

h.tap();/** 类似订阅 */
h.start();/** 类似发布 */

/* 打印顺序：
    node call end.
    react call end.
    最终的回调
*/


```


 

---

> 当然，作者的能力还没有到完全解析`webpack`的水平，如果有兴趣可以深入研究下`Tapable这个库的源码`

有兴趣深入研究的可以看看这两篇文章

 [深入理解Webpack核心模块Tapable钩子---同步版][4]

[深入理解Webpack核心模块Tapable钩子---异步版][5]
 
今天先写到这里了，如果觉得写得不错，别忘了点个赞

欢迎加入`segmentFault`前端交流群

我的个人微信:`CALASFxiaotan` 拉你进群

小姐姐们等你哦～ 


  [1]: https://segmentfault.com/a/1190000020034137
  [2]: https://segmentfault.com/a/1190000019126657
  [3]: https://github.com/JinJieTan/mini-webpack
  [4]: https://segmentfault.com/a/1190000018312127
  [5]: https://segmentfault.com/a/1190000018312930