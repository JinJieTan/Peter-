export default combineReducers = reducers => (state = {}, action) => Object.keys(reducers).reduce((currentState, key) => {
    currentState[key] = reducers[key](state[key], action);
    return currentState;
}, {});