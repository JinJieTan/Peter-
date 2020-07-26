import {
    reqSlides,
    reqIndexActivityModule,
    reqKingKongModule,
    reqCategoryModule,
    reqTagList
} from '../api'
import {
    slides,
    IndexActivityModules,
    shopcartDel,
    shopcartAdd,
    KingKongModules,
    CategoryModules,
    TitleColorTransparent,
    TitleColorWhite
} from './actions-types'

//同步将数据传递给reducers
export const IndexActivityModule = (data) => {
    return { type: IndexActivityModules, data }
}
//异步获取首页导航的的数据
export const AsyncIndexActivityModule = () => {
    return async (dispatch) => {
        const result = await reqIndexActivityModule()
        dispatch(IndexActivityModule(result.data))
    }
}

//同步将数据传递给reducers
export const Slide = (data) => {
    return { type: slides, data }
}
//异步获取走马灯的数据
export const AsyncSlide = () => {
    return async (dispatch) => {
        const result = await reqSlides()
        dispatch(Slide(result.data))
    }
}

// 同步将数据传递给reducers
export const KingKongModule = (data) => {
    return { type: KingKongModules, data }
}
//异步获取slide下面十张图片的数据
export const AsyncKingKongModule = () => {
    return async (dispatch) => {
        const result = await reqKingKongModule()
        dispatch(KingKongModule(result.data))
    }
}

// 同步将数据传递给reducers
export const CategoryModule = (data) => {
    return { type: CategoryModules, data }
}
//异步获取categorymodules的数据
export const AsyncCategoryModule = () => {
    return async (dispatch) => {
        const result = await reqCategoryModule()
        dispatch(CategoryModule(result.data))
    }
}

// 同步将title的颜色数据传递给reducers 
export const TitleColorTransparents = (data) => {
    return { type: TitleColorTransparent, data }
}

export const TitleColorRed = (data) => {
    return { type: TitleColorWhite, data }
}
//修改title的颜色
export const AsyncTitleColor = (data) => {
    return (dispatch) => {
        if (data === "transparent") {
            dispatch(TitleColorTransparents(data))
        } else if (data === "red") {
            dispatch(TitleColorRed(data))
        }
    }

}

//向购物车中添加或者删除内容，传入数据就增，不传入就默认减去购物车最后一条内容 功能慢慢迭代
export const shopcart=(data)=>{
    if(data){ 
        return{
            type:shopcartAdd,
            data:data
        }
    }else{
        return{
            type:shopcartDel,
            data:''
        }
    }
}


// 请求第三页拼购的数据 

