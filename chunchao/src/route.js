import { loadApp } from './index';
const HIJACK_EVENTS_NAME = /^(hashchange|popstate)$/i;
const EVENTS_POOL = {
  hashchange: [],
  popstate: [],
};

function reroute() {
  loadApp();
}

window.addEventListener('hashchange', reroute);
window.addEventListener('popstate', reroute);

const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
window.addEventListener = function (eventName, handler) {
  if (
    eventName &&
    HIJACK_EVENTS_NAME.test(eventName) &&
    typeof handler === 'function'
  ) {
    EVENTS_POOL[eventName].indexOf(handler) === -1 &&
      EVENTS_POOL[eventName].push(handler);
  }
  return originalAddEventListener.apply(this, arguments);
};
window.removeEventListener = function (eventName, handler) {
  if (eventName && HIJACK_EVENTS_NAME.test(eventName)) {
    let eventsList = EVENTS_POOL[eventName];
    eventsList.indexOf(handler) > -1 &&
      (EVENTS_POOL[eventName] = eventsList.filter((fn) => fn !== handler));
  }
  return originalRemoveEventListener.apply(this, arguments);
};

function mockPopStateEvent(state) {
  return new PopStateEvent('popstate', { state });
}

// 拦截history的方法，因为pushState和replaceState方法并不会触发onpopstate事件，所以我们即便在onpopstate时执行了reroute方法，也要在这里执行下reroute方法。
const originalPushState = window.history.pushState;
const originalReplaceState = window.history.replaceState;
window.history.pushState = function (state, title, url) {
  let result = originalPushState.apply(this, arguments);
  reroute(mockPopStateEvent(state));
  return result;
};
window.history.replaceState = function (state, title, url) {
  let result = originalReplaceState.apply(this, arguments);
  reroute(mockPopStateEvent(state));
  return result;
};

// 再执行完load、mount、unmout操作后，执行此函数，就可以保证微前端的逻辑总是第一个执行。然后App中的Vue或React相关Router就可以收到Location的事件了。
export function callCapturedEvents(eventArgs) {
  if (!eventArgs) {
    return;
  }
  if (!Array.isArray(eventArgs)) {
    eventArgs = [eventArgs];
  }
  let name = eventArgs[0].type;
  if (!HIJACK_EVENTS_NAME.test(name)) {
    return;
  }
  EVENTS_POOL[name].forEach((handler) => handler.apply(window, eventArgs));
}
