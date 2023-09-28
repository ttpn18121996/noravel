'use strict';

const container = require('../Foundation/Container').getInstance();
const { _obj } = require('../Support/helpers');

class Route {
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
    const resolvedMiddlewares = [];
    const registeredMiddlewares = require(container.getBaseDir('app/Http/Middleware')).middlewares;

    for (const middleware of this.getMiddlewares()) {
      const resolveMiddleware = require(container.getBaseDir(
        `app/Http/Middleware/${_obj.get(registeredMiddlewares, middleware)}`
      ));
      resolvedMiddlewares.push(resolveMiddleware);
    }

    return resolvedMiddlewares;
  }

  execute(req, res) {
    if (!this.action) {
      return this.controller(req, res);
    }

    return new this.controller(req, res)[this.action]();
  }
}

module.exports = Route;
