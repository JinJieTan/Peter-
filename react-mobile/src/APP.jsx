import React from 'react';
import Title from './components/title/index.jsx';
import Home from './pages/home/index.jsx';
import Category from './pages/home/categorys/index1.jsx';
import Buy from './pages/buy/index.jsx';
import Shopcart from './pages/shopcart/index.jsx';
import Person from './pages/person/index.jsx';
import Search from './pages/search/index.jsx';
import Shop from './pages/shop/index.jsx';
import { withRouter } from 'react-router-dom';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';

const childRoutes = ((r) => {
  console.log(r.keys(), 'keys');
  return r.keys().map((key) => {
      console.log(key,'key',r(key))
    return r(key);
  });
})(require.context('./pages', true, /\.jsx$/));

console.log(childRoutes, 'childRoutes');

//第二页，分类模块的文件使用react-loadable按需加载并且代码分割
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSearchArr: [
        '/home',
        '/category',
        '/buy',
        'shopcart',
        'person',
        '/search',
      ],
    };
  }

  render() {
    let showFooter = true;
    const { pathname } = this.props.location;
    const { showSearchArr } = this.state;
    if (!showSearchArr.find((item) => item === pathname)) {
      showFooter = false;
    }
    return (
      <div className="wrap">
        <header className="Title">
          <Title></Title>
        </header>
        <div className="content">
          <Switch>
            <Route path="/home" component={Home}></Route>
            <Route path="/category" component={Category}></Route>
            <Route path="/buy" component={Buy}></Route>
            <Route path="/shopcart" component={Shopcart}></Route>
            <Route path="/person" component={Person}></Route>
            <Route path="/search" component={Search}></Route>
            <Route path="/shop" component={Shop}></Route>
            <Redirect to="/home"></Redirect>
          </Switch>
        </div>
        {showFooter ? (
          <footer className="footer">
            <NavLink to="/home" activeClassName="active" className="link">
              <i className="material-icons">favorite_border</i>
              <span>首页</span>
            </NavLink>
            <NavLink to="/category" activeClassName="active" className="link">
              <i className="material-icons">reorder</i>
              <span>分类</span>
            </NavLink>
            <NavLink to="/buy" activeClassName="active" className="link">
              <i className="material-icons">card_giftcard</i>
              <span>拼购</span>
            </NavLink>
            <NavLink to="/shopcart" activeClassName="active" className="link">
              <i className="material-icons">bookmark_border</i>
              <span>购物车</span>
            </NavLink>
            <NavLink to="/person" activeClassName="active" className="link">
              <i className="material-icons">account_box</i>
              <span>个人</span>
            </NavLink>
          </footer>
        ) : null}
      </div>
    );
  }
}

export default withRouter(App);
