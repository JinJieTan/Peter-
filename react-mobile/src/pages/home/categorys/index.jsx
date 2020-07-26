import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { AsyncCategoryModule } from '../../../redux-file/actions-creators'
import './index.less'
import Bscroll from 'better-scroll'
class App extends PureComponent {
    componentDidMount() {
        this.props.reqCategoryModule()
    }
    componentDidUpdate() {
        const arr = document.querySelectorAll('.swiper-wrap')
        if (!this.myScroll) {
            this.myScroll = new Bscroll(document.querySelector('.categorys'),{bounce:false})
        }
        requestIdleCallback(this.refresh)
    }
    refresh = () => {
        if (this.myScroll) {
            this.myScroll.refresh()
            this.id=requestIdleCallback(this.refresh)
        }
    }
    componentWillUnmount() {
        cancelIdleCallback(this.id)
    }
    render() {
        const { categorys } = this.props
        if (this.myScroll) {
            this.myScroll.refresh()
        }
        return (
            <div className="categorys">
                <div>
                    {categorys.map((item, index) => {
                        return (
                            <div key={index} className="category-container">
                                <img src={item.titlePicUrl} alt="" />
                                <div className="swiper-wrap">
                                   
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>
        )
    }
}


export default connect(
    (state) => ({ categorys: state.CategoryModule }),
    (dispatch) => ({
        reqCategoryModule() {
            const action = AsyncCategoryModule();
            dispatch(action)
        },
    })
)(App)
