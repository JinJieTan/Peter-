import React from 'react';
import { renderRoutes } from 'react-router-config';
import {Link} from 'react-router-dom'
const App = props => {
  return (
    <div>
      <div>app</div>
      <Link to={'/login'}>login</Link>
      <Link to={'/'}>home</Link>
      {renderRoutes(props.route.routes)}
    </div>
  );
};

export default App;
