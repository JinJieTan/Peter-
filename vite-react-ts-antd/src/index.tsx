import React from "react";
import dva from "dva";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale-provider/zh_CN";
import App from "./routers";
import "./assets/init/normalize.css";
import "./assets/less/index.less";
import createHistory from "history/createBrowserHistory";
//@ts-ignore
let test = dva.default || dva;
const app = test({
  history: createHistory(),
});

app.router((obj: any) => (
  <ConfigProvider locale={zhCN}>
    <App
      history={obj.history}
      match={obj.match}
      location={obj.location}
      getState={obj.app._store.getState}
      dispatch={obj.app._store.dispatch}
    />
  </ConfigProvider>
));
app.start("#root");


