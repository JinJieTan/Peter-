import axios from 'axios'
//data传入必须是对象
export default function ajax(url, data, method = "GET") {
    let promise;
    if (method = "GET") {
        promise = axios.get(url, { params: data })
    } else {
        promise = axios.post(url, data)
    }
    return promise.then(res => {
        return res.data
    }).catch(err => {
        console.log('请求失败了')
        console.log(err)
        console.log('请求失败了')
    })
}