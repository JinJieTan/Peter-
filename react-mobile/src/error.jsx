import React from 'react';

export default class App extends React.PureComponent {
  state = {
    isError: false
  };
  componentDidCatch(err, info) {
    this.setState({
      isError: true
    });
    console.log(err, info);
  }
  render() {
    const { isError } = this.state;
    return (
      <div>{isError ? <div>错误捕获展示的界面</div> : this.props.children}</div>
    );
  }
}
