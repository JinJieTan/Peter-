import React from 'react'
import './index.less'
import Bscroll from 'better-scroll'
export default class App extends React.Component {
    constructor() {
        super()
        this.buy = React.createRef()
    }
    componentDidMount() {
        new Bscroll(this.buy.current)
    }
    render() {
        return (
            <div className="buy-wrap" ref={this.buy}>
                <div className="buy-inner">
                    <div className="buy-title">
                        <img src="//img10.360buyimg.com/wq/jfs/t1/45830/9/459/168993/5cd93f2dE322bb712/2f4d8ba37e6d1b15.gif" alt="" />
                    </div>
                    <div className="buy-content">
                        <img src="//img10.360buyimg.com/wq/jfs/t1/37272/8/6827/56273/5cc562e5Eb6f71ec1/cbf5f2ff3013adfc.jpg!q70.dpg" alt="" />
                    </div>
                    <div className="buy-footer">

                    </div>
                </div>
            </div>
        )
    }
}