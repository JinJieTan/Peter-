module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 7,
        sourceType: 'module',
    },
    parser: '@typescript-eslint/parser',
    plugins: ['typescript', 'react'],
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    rules: {
        semi: ['error', 'always'], // 该规则强制使用一致的分号
        'no-unused-vars': 'off', // 禁止未使用过的变量
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', //生产环境禁用 debugger
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off', //生产环境禁用 console
        'default-case': ['warn', { commentPattern: '^no default$' }], //要求 Switch 语句中有 Default
        'dot-location': ['warn', 'property'], // 强制在点号之前或之后换行
        eqeqeq: ['error', 'allow-null'], //要求使用 === 和 !==
        'new-parens': 'warn', //要求调用无参构造函数时带括号
        'no-caller': 'error', // 禁用 caller 或 callee
        'no-const-assign': 'error', //不允许改变用 const 声明的变量
        'no-dupe-args': 'error', //禁止在 function 定义中出现重复的参数
        'no-dupe-class-members': 'error', //不允许类成员中有重复的名称
        'no-dupe-keys': 'warn', //禁止在对象字面量中出现重复的键
        'no-extend-native': 'warn', //禁止扩展原生对象
        'no-extra-bind': 'warn', //禁止不必要的函数绑定
        'no-fallthrough': 'error', //禁止 case 语句落空
        'no-func-assign': 'warn', //禁止对 function 声明重新赋值
        'no-implied-eval': 'error', //禁用隐式的 eval()
        'no-label-var': 'error', //禁用与变量同名的标签
        'no-loop-func': 'error', //禁止循环中存在函数
        'no-mixed-operators': [
            'warn',
            {
                groups: [
                    ['&', '|', '^', '~', '<<', '>>', '>>>'],
                    ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
                    ['&&', '||'],
                    ['in', 'instanceof'],
                ],
                allowSamePrecedence: false,
            },
        ], //禁止混合使用不同的操作符
        'no-multi-str': 'warn', //禁止多行字符串 (需要多行时用\n)
        'no-native-reassign': 'warn', //禁止重新分配本地对象
        'no-obj-calls': 'warn', //禁止将全局对象当作函数进行调用
        'no-redeclare': 'error', //禁止重新声明变量
        'no-script-url': 'warn', //禁用 Script URL
        'no-shadow-restricted-names': 'warn', //关键字不能被遮蔽
        'no-sparse-arrays': 'warn', //禁用稀疏数组
        'no-this-before-super': 'warn', //在构造函数中禁止在调用 super()之前使用 this 或 super
        'no-undef': 'error', //禁用未声明的变量
        'no-unexpected-multiline': 'warn', //禁止使用令人困惑的多行表达式
        'no-use-before-define': [
            'warn',
            {
                functions: false,
                classes: false,
                variables: false,
            },
        ], //禁止定义前使用
        'no-with': 'error', //禁用 with 语句
        radix: 'error', //禁用函数内没有 yield 的 generator 函数
        'rest-spread-spacing': ['warn', 'never'], //强制限制扩展运算符及其表达式之间的空格
        'react/jsx-no-undef': 'error', //在 JSX 中禁止未声明的变量
        'react/no-direct-mutation-state': 'error', //禁止 this.state 的直接变化
        'react/jsx-uses-react': 'warn', //防止 React 被错误地标记为未使用
        'no-alert': 0, //禁止使用alert confirm prompt
        'no-duplicate-case': 2, //switch中的case标签不能重复
        'no-eq-null': 2, //禁止对null使用==或!=运算符
        'no-inner-declarations': [2, 'functions'], //禁止在块语句中使用声明（变量或函数）
        'no-iterator': 2, //禁止使用__iterator__ 属性
        'no-negated-in-lhs': 2, //in 操作符的左边不能有!
        'no-octal-escape': 2, //禁止使用八进制转义序列
        'no-plusplus': 0, //禁止使用++，--
        'no-self-compare': 2, //不能比较自身
        'no-undef-init': 2, //变量初始化时不能直接给它赋值为undefined
        'no-unused-expressions': 2, //禁止无用的表达式
        'no-useless-call': 2, //禁止不必要的call和apply
        'init-declarations': 0, //声明时必须赋初值
        'prefer-const': 0, //首选const
        'use-isnan': 2, //禁止比较时使用NaN，只能用isNaN()
        'vars-on-top': 2, //var必须放在作用域顶部
    },
};
