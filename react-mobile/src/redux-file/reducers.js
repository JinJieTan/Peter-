import { combineReducers } from 'redux'
import { slides, IndexActivityModules, KingKongModules, shopcartAdd, shopcartDel, CategoryModules, TitleColorTransparent, TitleColorWhite } from './actions-types'

//处理首页走马灯内容
function slide(prevState, action) {
    switch (action.type) {
        case slides:
            return action.data
        default:
            return prevState || []
    }
}
//首页navigationbar的内容 
function IndexActivityModule(prevState, action) {
    switch (action.type) {
        case IndexActivityModules:
            return action.data
        default:
            return prevState || []
    }
}
//首页8张小图片的内容~
function KingKong(prevState, action) {
    switch (action.type) {
        case KingKongModules:
            return action.data
        default:
            return prevState || []
    }
}
//第二页的数据，已经删减大部分 
function CategoryModule(prevState, action) {
    switch (action.type) {
        case CategoryModules:
            return action.data
        default:
            return prevState || []
    }
}
//首页头部的颜色随着滑动的距离变化
function TitleColor(prevState, action) {
    switch (action.type) {
        case TitleColorTransparent:
            return 'transparent'
        case TitleColorWhite:
            return '#cd2525'
        default:
            return 'transparent'
    }
}
//购物车里面的内容 初始为空数组   定义删减购物车的内容 
function shopcartArr(prevState, action) {
    switch (action.type) {
        case shopcartAdd:
            return [...prevState, action.data]
        case shopcartDel:
            return prevState.pop() || []
        default:
            return prevState || []
    }
}

export default combineReducers({
    slide,
    IndexActivityModule,
    KingKong,
    CategoryModule,
    TitleColor,
    shopcartArr
})