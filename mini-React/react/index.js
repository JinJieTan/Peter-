import { Component } from '../components/component';
import { useState } from '../reactDom';
const React = {};
React.Component = Component;
React.myUseState = useState;
export const myUseState = useState;
React.createElement = function (tag, attrs, ...children) {
  return {
    tag,
    attrs,
    children,
  };
};
export default React;
