import { Router as ExpressRouter } from 'express';
import Route from './Route.js';

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
  }

  add(method, uri, action) {
    const newRoute = new Route(uri, action);

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
