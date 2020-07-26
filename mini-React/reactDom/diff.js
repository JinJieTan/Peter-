import { Component } from '../react';
import handleAttrs from '../reactDom/handleAttrs';
import { setComponentProps, createComponent } from '../components/utills';
/**
 * @param {HTMLElement} dom 真实DOM
 * @param {vnode} vnode 虚拟DOM
 * @param {HTMLElement} container 容器
 * @returns {HTMLElement} 更新后的DOM
 */
export function diff(dom, vnode, container) {
  const ret = diffNode(dom, vnode);

  if (container && ret.parentNode !== container) {
    container.appendChild(ret);
  }

  return ret;
}

export function diffNode(dom, vnode) {
  let out = dom;

  if (vnode === undefined || vnode === null || typeof vnode === 'boolean')
    vnode = '';

  if (typeof vnode === 'number') vnode = String(vnode);

  // diff text node
  if (typeof vnode === 'string') {
    // 如果当前的DOM就是文本节点，则直接更新内容
    if (dom && dom.nodeType === 3) {
      // nodeType: https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
      if (dom.textContent !== vnode) {
        dom.textContent = vnode;
      }
      // 如果DOM不是文本节点，则新建一个文本节点DOM，并移除掉原来的
    } else {
      out = document.createTextNode(vnode);
      if (dom && dom.parentNode) {
        dom.parentNode.replaceChild(out, dom);
      }
    }

    return out;
  }

  if (typeof vnode.tag === 'function') {
    return diffComponent(dom, vnode);
  }

  //
  if (!dom || !isSameNodeType(dom, vnode)) {
    out = document.createElement(vnode.tag || vnode.type);

    if (dom) {
      [...dom.childNodes].map(out.appendChild); // 将原来的子节点移到新节点下

      if (dom.parentNode) {
        dom.parentNode.replaceChild(out, dom); // 移除掉原来的DOM对象
      }
    }
  }

  if (
    (vnode.children && vnode.children.length > 0) ||
    (out.childNodes && out.childNodes.length > 0)
  ) {
    diffChildren(out, vnode.children);
  }

  diffAttributes(out, vnode);

  return out;
}

function diffChildren(dom, vchildren) {
  const domChildren = dom.childNodes;
  //没有key值的真实dom集合
  const children = [];
  //有key值的集合
  const keyed = {};

  if (domChildren.length > 0) {
    for (let i = 0; i < domChildren.length; i++) {
      const child = domChildren[i];
      const key = child.key;
      if (key) {
        keyed[key] = child;
      } else {
        children.push(child);
      }
    }
  }

  if (vchildren && vchildren.length > 0) {
    let min = 0;
    let childrenLen = children.length;

    for (let i = 0; i < vchildren.length; i++) {
      const vchild = vchildren[i];
      const key = vchild.key;
      let child;

      if (key) {
        if (keyed[key]) {
          child = keyed[key];
          keyed[key] = undefined;
        }
      } else if (min < childrenLen) {
        for (let j = min; j < childrenLen; j++) {
          let c = children[j];

          if (c && isSameNodeType(c, vchild)) {
            child = c;
            children[j] = undefined;

            if (j === childrenLen - 1) childrenLen--;
            if (j === min) min++;
            break;
          }
        }
      }

      child = diffNode(child, vchild);

      const f = domChildren[i];
      if (child && child !== dom && child !== f) {
        if (!f) {
          dom.appendChild(child);
        } else if (child === f.nextSibling) {
          removeNode(f);
        } else {
          dom.insertBefore(child, f);
        }
      }
    }
  }
}

function diffComponent(dom, vnode) {
  let c = dom && dom._component;
  let oldDom = dom;

  // 如果组件类型没有变化，则重新set props
  if (c && c.constructor === vnode.tag) {
    setComponentProps(c, vnode.attrs);
    dom = c.base;
    // 如果组件类型变化，则移除掉原来组件，并渲染新的组件
  } else {
    if (c) {
      unmountComponent(c);
      oldDom = null;
    }

    c = createComponent(vnode.tag, vnode.attrs);

    setComponentProps(c, vnode.attrs);
    dom = c.base;

    if (oldDom && dom !== oldDom) {
      oldDom._component = null;
      removeNode(oldDom);
    }
  }

  return dom;
}

export function unmountComponent(component) {
  if (component.componentWillUnmount) component.componentWillUnmount();
  removeNode(component.base);
}

export function isSameNodeType(dom, vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return dom.nodeType === 3;
  }

  if (typeof vnode.tag === 'string') {
    return dom.nodeName.toLowerCase() === vnode.tag.toLowerCase();
  }

  return dom && dom._component && dom._component.constructor === vnode.tag;
}

export function diffAttributes(dom, vnode) {
  const old = {}; // 当前DOM的属性
  const attrs = vnode.attrs; // 虚拟DOM的属性

  for (let i = 0; i < dom.attributes.length; i++) {
    const attr = dom.attributes[i];
    old[attr.name] = attr.value;
  }

  // 如果原来的属性不在新的属性当中，则将其移除掉（属性值设为undefined）
  for (let name in old) {
    if (!(name in attrs)) {
      handleAttrs(dom, name, undefined);
    }
  }

  // 更新新的属性值
  for (let name in attrs) {
    if (old[name] !== attrs[name]) {
      handleAttrs(dom, name, attrs[name]);
    }
  }
}

function removeNode(dom) {
  if (dom && dom.parentNode) {
    dom.parentNode.removeChild(dom);
  }
}
