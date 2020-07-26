import React from 'react';
import { connect } from 'react-redux';
import { async } from '../containers/redux-file/actions-creators';
class Home extends React.PureComponent {
  componentDidMount() {
    if (this.props.data.length) {
      return;
    }
    this.props.test([1,2,3]);
  }
  render() {
    const { data } = this.props;
    return (
      <div>
        <div>谭金杰的ssr~</div>
        <button
          onClick={() => {
            alert('666');
          }}
        >
          click
        </button>
        {data.map((item, key) => {
          return <div key={key}>{item}</div>;
        })}
      </div>
    );
  }
}

const exportconnect = connect(
  state => ({
    data: state.tests.list
  }),
  dispatch => ({
    test(data) {
      const action = async(data);
      dispatch(action);
    }
  })
)(Home);

exportconnect.loadData = store => {
  console.log('loaddata')
  return store.dispatch(async());
};
export default exportconnect;
