import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import store from './redux-file/store.js'
import { HashRouter ,BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import './mock'
import './assets/index.less'

ReactDOM.render(
    <HashRouter>
        <Provider store={store}><App ></App></Provider>
    </HashRouter>,
    document.querySelector('#root')
)