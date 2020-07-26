import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import reducers from './reducers';

export const getClientStore = () => {
  const defaultState = window.context ? window.context.state : {};
  return createStore(reducers, defaultState, applyMiddleware(thunk));
};

export const serverStore = () => {
  return createStore(reducers, applyMiddleware(thunk));
};
