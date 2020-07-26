import React from './react/index';
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      test: 0,
    };
  }

  handleClick(e) {
    this.setState({
      test: this.state.test + 1,
    });
  }

  componentDidMount() {
    console.log('mount');
    this.setState({
      test: 1,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.test > 5) {
      console.log('shouldComponentUpdate中限制了更新');
      alert('shouldComponentUpdate中限制了更新');
      return false;
    }
    return true;
  }

  componentWillMount() {
    console.log('willMount');
  }

  componentWillUpdate() {
    console.log('willupdate');
  }

  componentDidUpdate() {
    console.log('didupdate');
  }

  render() {
    return (
      <div>
        <span>{this.state.test}</span>
        <button onClick={this.handleClick.bind(this)}>改变状态</button>
        <ul>
          <li>1</li>
          <li>
            <a href="">测试</a>
          </li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
        </ul>
      </div>
    );
  }
}
