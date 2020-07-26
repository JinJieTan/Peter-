const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default; // traverse 采用的 ES Module 导出，我们通过 requier 引入的话就加个 .default
const babel = require('@babel/core');
const { entry: entrys } = require('./minit-webpack.config');
const read = filename => {
  const buffer = fs.readFileSync(filename, 'utf-8');
  const AST = parser.parse(buffer, { sourceType: 'module' });
  // 依赖收集
  const dependencies = {};

  // 使用 traverse 来遍历 AST
  traverse(AST, {
    ImportDeclaration({ node }) {
      // 函数名是 AST 中包含的内容，参数是一些节点，node 表示这些节点下的子内容
      const dirname = path.dirname(filename); // 我们从抽象语法树里面拿到的路径是相对路径，然后我们要处理它，在 bundler.js 中才能正确使用
      const newDirname =
        './' + path.join(dirname, node.source.value).replace('\\', '/'); // 将dirname 和 获取到的依赖联合生成绝对路径
      dependencies[node.source.value] = newDirname; // 将源路径和新路径以 key-value 的形式存储起来
    }
  });

  // 将抽象语法树转换成浏览器可以运行的代码
  const { code } = babel.transformFromAst(AST, null, {
    presets: ['@babel/preset-env']
  });

  return {
    filename,
    dependencies,
    code
  };
};

// 创建依赖图谱函数, 递归遍历所有依赖模块
const makeDependenciesGraph = entry => {
  const entryModule = read(entry);
  const graghArray = [entryModule]; // 首先将我们分析的入口文件结果放入图谱数组中
  for (let i = 0; i < graghArray.length; i++) {
    const item = graghArray[i];
    const { dependencies } = item; // 拿到当前模块所依赖的模块
    if (dependencies) {
      for (let j in dependencies) {
        // 通过 for-in 遍历对象
        graghArray.push(read(dependencies[j])); // 如果子模块又依赖其它模块，就分析子模块的内容
      }
    }
  }

  const gragh = {}; // 将图谱的数组形式转换成对象形式
  graghArray.forEach(item => {
    gragh[item.filename] = {
      dependencies: item.dependencies,
      code: item.code
    };
  });
  console.log(gragh);
  return gragh;
};

const generateCode = entry => {
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
			require('${entry}')
		})(${gragh})
	`;
};

const code = generateCode(entrys);

console.log(code);
