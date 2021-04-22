import React from 'react';
import { Route, Switch, Router, Redirect } from 'dva/router';
import Home from './home';
import { RouteComponentProps } from 'dva/router';
import { SubscriptionAPI } from 'dva';
interface Props extends RouteComponentProps {}
const App = (props: Props & SubscriptionAPI) => {
    return (
        <Router history={props.history}>
            <Switch>
                <Route
                    path="/home"
                    render={() => {
                        return <Home />;
                    }}
                ></Route>
                <Route
                    path="/"
                    render={() => {
                        return <Home />;
                    }}
                ></Route>
                </Switch>
        </Router>
    );
};
export default App;
