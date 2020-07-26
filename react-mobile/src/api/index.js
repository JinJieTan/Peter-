import ajax from './ajax'
//请求swiper首页的图片
export const reqSlides = () => ajax('/slides')
//siwper下面三个标签的内容
export const reqPolicyDescList = () => ajax('/policyDescList')
//请求siwper下面十个图片和描述
export const reqKingKongModule = () => ajax('/kingKongModule')
//请求新人专享礼下面的图片
export const reqIndexActivityModule = () => ajax('/indexActivityModule')
//请求品牌制造商直供内容
export const reqTagList = () => ajax('/tagList')
//请求类目热销榜
export const reqCategoryList = () => ajax('/categoryList')
//请求人气推荐的内容
export const reqPopularitemList = () => ajax('/popularitemList')
//请求限时购模块内容
export const reqFlashSaleModule = () => ajax('/flashSaleModule')
//请求新品首发模块内容
export const reqNewItemList = () => ajax('/newItemList')
//categoryModule模块的内容
export const reqCategoryModule = () => ajax('/categoryModule')
//请求分类页面的全部内容
export const reqCategoryL1List = () => ajax('/categoryL1List')

//这里如果考虑上线需要加上prev前缀，三元运算符根据环境变量  不考虑上线所以我直接写死了

//const prev = process.env.NODE_ENV === "development" ?  ""   :   "*****上线的请求资源地址"