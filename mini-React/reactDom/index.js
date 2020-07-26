import { createComponent, setComponentProps } from '../components/utills';
import handleAttrs from './handleAttrs';

const ReactDom = {};

export let currentComponent = null; //当前组件实例
export let currentIndex; // 当前state指针 抽象index

//传入虚拟dom节点和真实包裹节点，把虚拟dom节点通过_render方法转换成真实dom节点，然后插入到包裹节点中，这个就是react的初次渲染
const render = function (vnode, container) {
  return container.appendChild(_render(vnode));
};

ReactDom.render = render;

export function _render(vnode) {
  console.log('_render ');
  if (vnode === undefined || vnode === null || typeof vnode === 'boolean')
    vnode = '';

  if (typeof vnode === 'number') vnode = String(vnode);

  if (typeof vnode === 'string') {
    let textNode = document.createTextNode(vnode);
    return textNode;
  }
  if (typeof vnode.tag === 'function') {
    //hooks
    const component = createComponent(vnode.tag, vnode.attrs);
    currentComponent = component; //赋值取到当前组件实例
    currentIndex = 0;
    currentComponent.currentIndex = currentIndex;
    setComponentProps(component, vnode.attrs, currentComponent);
    return component.base;
  }
  const dom = document.createElement(vnode.tag);
  if (vnode.attrs) {
    Object.keys(vnode.attrs).forEach((key) => {
      const value = vnode.attrs[key];
      handleAttrs(dom, key, value); //如果有属性，例如style标签、onClick事件等，都会通过这个函数，挂在到dom上
    });
  }

  vnode.children && vnode.children.forEach((child) => render(child, dom)); // 递归渲染子节点

  return dom;
}

export const useState = (initialState) => {
  console.log(currentComponent, currentIndex, initialState, 'this');
  let value = initialState === undefined ? null : initialState;
  const setValue = (newValue) => {
    console.log(value, newValue, value === newValue, 'value === newValue');
    if (value === newValue) {
      return;
    }
    currentIndex++;
    value = newValue;
    // currentComponent.setState({});
  };
  return [value, setValue];
};

export default ReactDom;
