import React from 'react'
import { connect } from 'react-redux'
import Bscroll from 'better-scroll'
import './index.less'
import { Button, Toast, NoticeBar, Modal } from 'antd-mobile'
const prompt = Modal.prompt;
function loadingToast() {
    Toast.loading('即将付款请稍后', .4, () => {
    });
}
function successToast() {
    Toast.success('付款成功', .8);
}
class App extends React.Component {
    componentDidMount() {
        new Bscroll(document.querySelector('.shopcart-container'), {
            click: true,
        })

    }
    push = () => {

        loadingToast()
        setTimeout(() => {
            prompt(
                '请输入密码',
                '',
                [
                    { text: '取消' },
                    { text: '提交', onPress: password => { successToast() } },
                ],
                'secure-text',
            )
        }, 500)
    }
    render() {
        const { shopcart } = this.props
        const oldPriceAll = shopcart.reduce((prev, cur, index, arr) => {
            return prev += (+cur.oldPrice)
        }, 0)
        const nowPriceAll = shopcart.reduce((prev, cur, index, arr) => {
            return prev += (+cur.nowPrice)
        }, 0)
        return (
            <div className="shopcart-container">
                <div className="shopcart-content">
                    <NoticeBar marqueeProps={{ loop: true, style: { padding: '0 10px' } }}>
                        京东年度节日6.18,百亿红包大放送，赶紧下载App选购选购下单吧~
    </NoticeBar>
                    {shopcart.length ?

                        shopcart.map((item, index) => {
                            return <div key={index} className="shop-item">
                                <div className="shop-items">
                                    <img src={item.picUrl} alt="" />
                                    <div className="shop-text">
                                        <span className="shop-desc">服务保障：{item.desc}</span><br />
                                        <span className="shop-adress">发货地址：{item.adress}</span><br />
                                        <span className="shop-oldPrice">原价：{item.oldPrice}</span><br />
                                        <span className="shop-newPrice">现价：{item.nowPrice}</span><br />
                                    </div>
                                </div>
                            </div>
                        }) : <div> 购物车空空如也，先去逛逛吧~

                    </div>}
                    {shopcart.length ?
                        <div className="pushPay">
                            <div className="price">
                                <span className="shop-oldPrice">原价:{oldPriceAll}</span>
                                <span className="shop-newPrice">活动价:{nowPriceAll}</span>
                            </div>
                            <Button onClick={this.push}>结算</Button>
                        </div> : null}

                </div>
            </div>
        )
    }
}

export default connect(
    (state) => ({ shopcart: state.shopcartArr }),

)(App)