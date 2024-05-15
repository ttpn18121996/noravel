import { Router as ExpressRouter } from 'express';
import Route from './Route.js';
import { _obj } from 'tiny-supporter';

export default class Router {
  constructor() {
    this.routeRegistered = {
      get: [],
      post: [],
      put: [],
      patch: [],
      delete: [],
      options: [],
    };
    this.options = {
      middleware: [],
      prefix: '',
    };
  }

  add(method, uri, action) {
    const uriWithPrefix = _obj.get(this.options, 'prefix', '') + uri;
    const newRoute = new Route(uriWithPrefix, action);
    newRoute.middleware(_obj.get(this.options, 'middleware', []));

    if (this.routeRegistered?.[method.toLowerCase()]) {
      this.routeRegistered[method.toLowerCase()].push(newRoute);
    }

    return newRoute;
  }

  get(uri, action) {
    return this.add('get', uri, action);
  }

  post(uri, action) {
    return this.add('post', uri, action);
  }

  put(uri, action) {
    return this.add('put', uri, action);
  }

  patch(uri, action) {
    return this.add('patch', uri, action);
  }

  delete(uri, action) {
    return this.add('delete', uri, action);
  }

  options(uri, action) {
    return this.add('options', uri, action);
  }

  group(options, callback) {
    this.options = { ...this.options, ...options };
    callback();
    this.options = {
      middleware: [],
      prefix: '',
    };
  }

  run() {
    const router = ExpressRouter();
    const routeEntries = Object.entries(this.routeRegistered);

    for (const [method, routes] of routeEntries) {
      for (const route of routes) {
        const middlewares = route.resolveMiddlewares();
        middlewares.push((req, res, next) => route.execute(req, res, next));
        router[method](route.uri, ...middlewares);
      }
    }

    return router;
  }
}
