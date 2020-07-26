export default promise = function({ getState, dispatch }) {
    return function(next) {
        return function(action) {
            if (action.then) {
                action.then(dispatch);
            } else if (action.payload && action.payload.then) {
                action.payload.then(payload => dispatch({...action, payload }), payload => dispatch({...action, payload }));
            } else {
                next(action);
            }
        }
    }
}