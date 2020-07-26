import { combineReducers } from 'redux';
import { test } from './actions-types';
let defaultState = {
  name: 'aaa',
  list: [1, 2, 3]
};
function tests(state = defaultState, action) {
  switch (action.type) {
    case test:
      return {
        ...defaultState,
        list: ['test1', 'test2', 'test3']
      };
    default:
      return state;
  }
}

export default combineReducers({
  tests
});
