import Home from './containers/Home';
import Login from './containers/Login';
import App from './containers/app';
export default [
  {
    component: App,
    routes: [
      {
        path: '/',
        component: Home,
        exact: true,
        loadData: Home.loadData
      },
      {
        path: '/login',
        component: Login,
        exact: true
      }
    ]
  }
];
// export default [
//   {
//     path: '/',
//     component: Home,
//     exact: true,
//     // loadData: Home.loadData
//   },
//   {
//     path: '/login',
//     component: Login,
//     exact: true
//   }
// ];

