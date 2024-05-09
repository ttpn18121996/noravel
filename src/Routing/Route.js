import { _obj } from 'tiny-supporter';

export default class Route {
  constructor(uri, action) {
    this.uri = uri;
    this.middlewares = [];
    if (Array.isArray(action)) {
      this.controller = action[0];
      this.action = action[1];
    } else {
      this.controller = action;
    }
  }

  middleware(middlewares) {
    this.middlewares = this.middlewares.concat(middlewares);

    return this;
  }

  getMiddlewares() {
    return this.middlewares;
  }

  resolveMiddlewares() {
    return [];
  }

  execute(req, res, next) {
    if (!this.action) {
      return this.controller(req, res, next);
    }

    return new this.controller()[this.action](req, res, next);
  }
}
