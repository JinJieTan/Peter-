export default logger = function({ dispatch, getState }) {
    return function(next) {
        return function(action) {
            console.log(getState());
            next(action)
            console.log(getState())
        }
    }
}