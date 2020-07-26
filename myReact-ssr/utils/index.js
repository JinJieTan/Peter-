import Routes from '../Router';
import { renderToString } from 'react-dom/server';
import { StaticRouter, Link, Route } from 'react-router-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import routers from '../Router';
import { matchRoutes } from 'react-router-config';
export const render = (req, store) => {
  const matchedRoutes = matchRoutes(routers, req.path);
  matchedRoutes.forEach(item => {
    //如果这个路由对应的组件有loadData方法
    if (item.route.loadData) {
      item.route.loadData(store);
    }
  });
  console.log(store.getState(),Date.now())
  const content = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.path}>{renderRoutes(routers)}</StaticRouter>
    </Provider>
  );
  return `
      <html>
        <head>
          <title>ssr123</title>
        </head>
        <body>
          <div id="root">${content}</div>
          <script>window.context={state:${JSON.stringify(store.getState())}}</script>
          <script src="/index.js"></script>
        </body>
      </html>
    `;
};
