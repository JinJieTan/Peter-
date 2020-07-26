import { test } from './actions-types';

//同步将数据传递给reducers
export const sync = data => {
  return { type: test, data };
};

export const async = data => {
  return dispatch => {
    dispatch(sync(data));
  };
};
