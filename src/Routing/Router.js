'use strict';

const Route = require('./Route');

const initialRouteRegistered = {
  get: [],
  post: [],
  put: [],
  patch: [],
  delete: [],
  options: [],
};

class Router {
  constructor() {
    this.routeRegistered = initialRouteRegistered;
    this.add = this.add.bind(this);
    this.get = this.get.bind(this);
  }

  add(method, uri, action) {
    if (this.routeRegistered?.[method.toLowerCase()]) {
      this.routeRegistered[method.toLowerCase()].push(new Route(uri, action));
    }
  }

  get(uri, action) {
    this.add('get', uri, action);
  }

  post(uri, action) {
    this.add('post', uri, action);
  }

  put(uri, action) {
    this.add('put', uri, action);
  }

  patch(uri, action) {
    this.add('patch', uri, action);
  }

  delete(uri, action) {
    this.add('delete', uri, action);
  }

  options(uri, action) {
    this.add('options', uri, action);
  }

  any(uri, action) {
    const restfulMethods = Object.keys(initialRouteRegistered);
  }
}

module.exports = Router;
