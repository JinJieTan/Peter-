import React from 'react'
import './index.less'
export default class App extends React.Component {
    render() {
        return (
            <iframe
                src="https://m.jd.com/"
                className="iframe"
                seamless='seamless'
                frameBorder="0"
            ></iframe>
        )
    }
}