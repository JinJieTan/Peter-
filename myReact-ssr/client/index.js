//client/index. js
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { getClientStore } from '../containers/redux-file/store';
import {renderRoutes} from 'react-router-config'
import routers from '../Router';
const store = getClientStore();
const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>{renderRoutes(routers)}</BrowserRouter>
    </Provider>
  );
};
ReactDom.hydrate(<App />, document.getElementById('root'));
