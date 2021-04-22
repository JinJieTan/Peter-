import ajax from '@/utills/api/ajax';
const prev = '/api';
// 测试
export const getHomeList = (data: {}, method: string) => ajax(`${prev}/home-list`, data, method);
