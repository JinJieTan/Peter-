import React from 'react'
import { connect } from 'react-redux'
import { Carousel, WingBlank, Button, NoticeBar, Toast } from 'antd-mobile'
import './index.less'
import Bscroll from 'better-scroll'
import { shopcart } from '../../redux-file/actions-creators'
import { dispatch } from 'rxjs/internal/observable/range';
function successToast() {
    Toast.success('商品已加入购物车', 1);
}

class App extends React.Component {
    constructor() {
        super()
    }
    componentDidMount() {
        //避免开发模式下刷新会报错正常 因为是由主页传入的参数
        if (!this.props.location.state) {
            this.props.history.replace('/home')
            return null
        }
        //有渲染时间差的问题 需要换成hooks 这里使用requestAnimationFrame解决 代替vue的nextTicK()
        this.scroll = new Bscroll(document.querySelector('.shop-content'), {
            click: true,
        })
    }
    refresh = () => {
        if (this.scroll) {
            this.scroll.refresh()
        }
    }
    componentDidUpdate() {
        requestAnimationFrame(this.refresh)
    }
    handle = () => {
        this.props.history.replace('/shopcart')
    }

    addShopCart = (data) => {
        return () => {
            successToast()
            this.props.reqshopcartAdd(data)
        }
    }
    render() {
        //避免开发模式下刷新会报错正常 因为是由主页传入的参数
        if (!this.props.location.state) {
            this.props.history.replace('/home')
            return null
        }
        const { data } = this.props.location.state
        const { text, picUrl, adress, oldPrice, nowPrice, desc } = this.props.location.state.data
        return (<div className="shop-content">
            <div className="shop-swiper">
                <NoticeBar mode="closable" action={<span style={{ color: '#a1a1a1' }}>不再提示</span>}>
                    京东&nbsp;618&nbsp;特价即将来袭 请下载App准备~
            </NoticeBar>
                <WingBlank>
                    <Carousel
                        autoplay={true}
                        infinite={true}
                    >
                        <img src={picUrl} alt="" />
                        <img src="//m.360buyimg.com/mobilecms/s750x366_jfs/t1/16946/36/6712/200431/5c638b36E72b37200/06d91d8fd7116043.jpg!cr_1125x549_0_72!q70.jpg.dpg" alt="" />
                        <img src="//m.360buyimg.com/mobilecms/s750x366_jfs/t10213/130/2992826095/161860/59da4d8/5cde19d1Naea8582c.jpg!cr_1125x549_0_72!q70.jpg.dpg" alt="" />
                        <img src="//m.360buyimg.com/mobilecms/s750x366_jfs/t1/40496/22/1791/215523/5cc7ca20E0c48c1c8/75e564931ba0d8d8.jpg!cr_1125x549_0_72!q70.jpg.dpg" alt="" />
                    </Carousel>
                </WingBlank>
                <div className="buytitle-text" >类别：{text}</div>
                <div className="border-1px">
                </div>
                <div className="shop-desc">
                    <span className="shop-item-desc"><i className="material-icons">
                        star
                    </i>商品描述:{desc}</span><br />
                    <span className="shop-item-adress"><i className="material-icons">
                        star
                </i>发货地址:{adress}</span><br />
                    <span className="shop-item-oldPrice"><i className="material-icons">
                        star
                </i>原价:{oldPrice}</span><br />
                    <span className="shop-item-newPrice"><i className="material-icons">
                        star
                </i>京东618特价来袭:{nowPrice}</span><br />
                </div>
                <Button onClick={this.addShopCart(data)}>加入购物车</Button>
                <div className="shop-more">
                    <span><i className="material-icons">
                        child_care
                     </i>更多同类项商品:</span>
                </div> <br />
                <div className="border-1px">
                </div>
                <img src="//m.360buyimg.com/mobilecms/s750x366_jfs/t10744/282/3004928281/95727/1697099c/5cde2574N2ee53aa3.jpg!cr_1125x549_0_72!q70.jpg.dpg" alt="" />
                <img src="//m.360buyimg.com/mobilecms/s750x366_jfs/t10528/169/2888009201/467111/993af08b/5cdbbdbfN17295995.jpg!cr_1125x549_0_72!q70.jpg.dpg" alt="" />
                <img src="//m.360buyimg.com/mobilecms/s750x366_jfs/t29287/225/1333799961/117187/72cfe256/5cdcfc83Ncfa541d2.jpg!cr_1125x549_0_72!q70.jpg.dpg" alt="" />
                <div className="shop-cart">
                    <Button type="primary" onClick={this.handle}>前往购物车</Button>
                </div>
            </div>
        </div>
        )

    }
}

export default connect(
    null,
    // (state)=>({KingkongModule:state.KingKong}),
    // (dispatch) =>({
    // reqKingKongModule(){
    //     const action = AsyncKingKongModule();
    //     dispatch(action)
    // },
    (dispatch) => ({
        reqshopcartAdd(data) {
            const action = shopcart(data)
            dispatch(action)
        }
    })

    // })
)(App)