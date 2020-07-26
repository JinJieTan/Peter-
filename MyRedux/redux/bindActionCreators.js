export default function bindActionCreator(actions, dispatch) {
    let newActions = {};
    for (let key in actions) {
        newActions[key] = () => dispatch(actions[key].apply(null, arguments));
    }
    return newActions;
}