import Mock from 'mockjs'
import homeData from './homeData.json'
import categoryData from './category.json'
Mock.mock('/slides', { code: 0, data: homeData.slides }) //swiper的图片 
Mock.mock('/policyDescList', { code: 0, data: homeData.policyDescList }) //   //siwper下面三个标签的内容
Mock.mock('/kingKongModule', { code: 0, data: homeData.kingKongModule.kingKongList }) //请求siwper下面十个图片和描述
Mock.mock('/indexActivityModule', { code: 0, data: homeData.indexActivityModule }) //请求新人专享礼下面的图片
Mock.mock('/tagList', { code: 0, data: homeData.tagList }) //请求品牌制造商直供内容
Mock.mock('/categoryList', { code: 0, data: homeData.categoryHotSellModule.categoryList }) //请求类目热销榜
Mock.mock('/popularitemList', { code: 0, data: homeData.popularItemList }) //请求人气推荐的内容
Mock.mock('/flashSaleModule', { code: 0, data: homeData.flashSaleModule.itemList }) //请求限时购模块内容
Mock.mock('/newItemList', { code: 0, data: homeData.newItemList }) //请求新品首发模块内容
Mock.mock('/categoryModule', { code: 0, data: homeData.categoryModule }) //categoryModule模块的内容
Mock.mock('/categoryL1List', { code: 0, data: categoryData.categoryL1List }) //请求分类页面的全部内容