import { diffNode } from '../reactDom/diff';
import { Component } from './component';
export function createComponent(component, props) {
  let inst;
  // 如果是类定义组件，则直接返回实例
  if (component.prototype && component.prototype.render) {
    inst = new component(props);
    // 如果是函数定义组件，则将其扩展为类定义组件
  } else {
    inst = new Component(props);
    inst.constructor = component;
    inst.render = function () {
      return this.constructor(props);
    };
  }
  return inst;
}

export function setComponentProps(component, props, currentComponent) {
  if (!component.base) {
    if (component.componentWillMount) component.componentWillMount();
  } else if (component.base && component.componentWillReceiveProps) {
    component.componentWillReceiveProps(props);
  }

  component.props = props;

  renderComponent(component, currentComponent);
}

export function renderComponent(component, currentComponent) {
  console.log('renderComponent', component);
  if (!currentComponent) {
    let base;
    //返回虚拟dom对象 调用render方法，会用到state 此时的state已经通过上面的队列更新了
    const renderer = component.render();

    if (component.base && component.componentWillUpdate) {
      component.componentWillUpdate();
    }

    if (component.base && component.shouldComponentUpdate) {
      let result = true;
      result =
        component.shouldComponentUpdate &&
        component.shouldComponentUpdate(
          (component.props = {}),
          component.newState
        );
      if (!result) {
        return;
      }
    }
    //得到真实dom对象
    base = diffNode(component.base, renderer);
    console.log(base, 'base');
    if (component.base) {
      if (component.componentDidUpdate) component.componentDidUpdate();
    } else {
      component.base = base;
      base._component = component;
      component.componentDidMount && component.componentDidMount();
      return;
    }
    //挂载真实的dom对象到对应的 组件上 方便后期对比
    component.base = base;

    //挂载对应到组件到真实dom上 方便后期对比～
    base._component = component;
  } else {
    currentComponent.currentIndex++;
    console.log(currentComponent.currentIndex, 'currentComponent.currentIndex ');
    const renderer = component.render();
    console.log(component, renderer, 'renderer');
    const { tag, children = null } = renderer;
    const dom = document.createElement(tag);
    dom.innerHTML = children;
    component.base = dom;
    console.log(dom, 'dom ');
    dom._component = component;
  }
}
