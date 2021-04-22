import { message } from "antd";
import axios from "axios";
// data传入必须是对象
export default function ajax(url: string, data: object, method = "GET") {
  let promise;
  if (method === "GET") {
    promise = axios.get(url, { params: data });
  } else {
    promise = axios.post(url, data);
  }
  return promise
    .then((res: any) => {
      if (res?.data?.errcode === 0) {
        return res.data;
      } else {
        message.error(res.msg);
      }
    })
    .catch((err) => {
      // 这里可以用Antd的message.error(提示下错误)
      console.log("请求失败了");
      console.error(err);
      console.log("错误已经捕获");
    });
}
