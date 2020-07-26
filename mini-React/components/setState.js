import { renderComponent } from './utills';

/**
 * 队列   先进先出 后进后出 ～
 * @param {Array:Object} setStateQueue  抽象队列 每个元素都是一个key-value对象 key:对应的stateChange value:对应的组件
 * @param {Array:Component} renderQueue  抽象需要更新的组件队列 每个元素都是Component
 */
const setStateQueue = [];
const renderQueue = [];

function defer(fn) {
  //requestIdleCallback的兼容性不好，对于用户交互频繁多次合并更新来说，requestAnimation更有及时性高优先级，requestIdleCallback则适合处理可以延迟渲染的任务～
  //   if (window.requestIdleCallback) {
  //     console.log('requestIdleCallback');
  //     return requestIdleCallback(fn);
  //   }
  //高优先级任务 异步的 先挂起
  return requestAnimationFrame(fn);
}

export function enqueueSetState(stateChange, component) {
  //第一次进来肯定会先调用defer函数
  if (setStateQueue.length === 0) {
    //清空队列的办法是异步执行,下面都是同步执行的一些计算
    defer(flush);
  }
  // setStateQueue:[{state:{a:1},component:app},{state:{a:2},component:test},{state:{a:3},component:app}]

  //向队列中添加对象 key:stateChange value:component
  setStateQueue.push({
    stateChange,
    component,
  });

  //如果渲染队列中没有这个组件 那么添加进去
  if (!renderQueue.some((item) => item === component)) {
    renderQueue.push(component);
  }
}

function flush() {
  let item, component;
  //依次取出对象，执行
  while ((item = setStateQueue.shift())) {
    const { stateChange, component } = item;

    // 如果没有prevState，则将当前的state作为初始的prevState
    if (!component.prevState) {
      component.prevState = Object.assign({}, component.state);
    }

    // 如果stateChange是一个方法，也就是setState的第二种形式
    if (typeof stateChange === 'function') {
      Object.assign(
        component.state,
        stateChange(component.prevState, component.props)
      );
    } else {
      // 如果stateChange是一个对象，则直接合并到setState中
      Object.assign(component.state || {}, stateChange);
    }

    component.prevState = component.state;
  }
  //先做一个处理合并state的队列，然后把state挂载到component下面 这样下面的队列，遍历时候，能也拿到state属性
  //依次取出组件，执行更新逻辑，渲染
  while ((component = renderQueue.shift())) {
    renderComponent(component);
  }
}
