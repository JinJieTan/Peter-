export default thunk = function({ getState, dispatch }) {
    return function(next) {
        return function(action) {
            if (typeof action == 'function') {
                action(dispatch, getState);
            } else {
                next(action);
            }
        }
    }
}