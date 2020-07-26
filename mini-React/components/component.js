import { _render } from '../reactDom/index';
import { enqueueSetState } from './setState';
export class Component {
  constuctor(props = {}) {
    this.state = {};
    this.props = props;
  }
  setState(stateChange) {
    const newState = Object.assign(this.state || {}, stateChange);
    console.log(newState,'newState')
    this.newState = newState;
    enqueueSetState(newState, this);
  }
}
