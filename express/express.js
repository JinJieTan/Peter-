const { createServer } = require("http");

class express {
  constructor() {
    this.routers = {
      get: [],
      post: [],
      all: [],
    };
  }

  handleAddRouter(path, handle) {
    let router = {};
    if (typeof path === "string") {
      router = {
        path,
        handle,
      };
    } else {
      router = {
        path: "/",
        handle: path,
      };
    }
    return router;
  }

  get(path, handle) {
    const router = this.handleAddRouter(path, handle);
    this.routers.get.push(router);
  }

  post(path, handle) {
    const router = this.handleAddRouter(path, handle);
    this.routers.post.push(router);
  }

  use(path, handle) {
    const router = this.handleAddRouter(path, handle);
    this.routers.all.push(router);
  }

  search(method, url) {
    const matchedList = [];
    [...this.routers[method], ...this.routers.all].forEach((item) => {
      item.path === url && matchedList.push(item.handle);
    });
    return matchedList;
  }

  handle(req, res, matchedList) {
    const next = () => {
      const midlleware = matchedList.shift();
      if (midlleware) {
        midlleware(req, res, next);
      }
    };
    next();
  }
  
  cb() {
    return (req, res) => {
      const method = req.method.toLowerCase();
      const url = req.url;
      const matchedList = this.search(method, url);
      this.handle(req, res, matchedList);
    };
  }

  listen(...args) {
    createServer(this.cb()).listen(...args);
  }
}

module.exports = express;
