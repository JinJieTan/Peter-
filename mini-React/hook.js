import React, { myUseState } from './react';


export default function hook(props) {
  const [state, setState] = myUseState(0);
  console.log(state, setState,props, 'hook');
  setState(1)
  return <div>hooks:{state}</div>;
}
