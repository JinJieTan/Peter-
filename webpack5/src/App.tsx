import React from 'react';
import Myy from './myy.jpg'

function App() {
    return (
        <div className="app">
            <h1>欢迎使用明源云 - 云空间前端通用脚手架</h1>
            <img src={Myy} alt="" style={{ width: 500, height: 500 }} />
            <h4>加入我们：<a>453089136@qq.com</a></h4>
            <h4>微前端,webpack5,TypeScript,React,vite应有尽有</h4>
        </div>
    );
}

export default App;
