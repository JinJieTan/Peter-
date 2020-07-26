export default function createStore(reducer, enhancer) {
    if (typeof enhancer !== 'undefined') {
        return enhancer(createStore)(reducer)
    }
    let state = null
    const listeners = []
    const subscribe = (listener) => {
        listeners.push(listener)
    }
    const getState = () => state
    const dispatch = (action) => {
        state = reducer(state, action)
        listeners.forEach((listener) => listener())
    }
    dispatch({})
    return { getState, dispatch, subscribe }
}