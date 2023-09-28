'use strict';

const Route = require('./Route');

const Router = () => {
  const routeRegistered = {
    get: [],
    post: [],
    put: [],
    patch: [],
    delete: [],
    options: [],
  }

  const add = (method, uri, action) => {
    const newRoute = new Route(uri, action);
    if (routeRegistered?.[method.toLowerCase()]) {
      routeRegistered[method.toLowerCase()].push(newRoute);
    }

    return newRoute;
  };

  return {
    add,
    get: (uri, action) => add('get', uri, action),
    post: (uri, action) => add('post', uri, action),
    put: (uri, action) => add('put', uri, action),
    patch: (uri, action) => add('patch', uri, action),
    delete: (uri, action) => add('delete', uri, action),
    options: (uri, action) => add('options', uri, action),
    routeList: () => {
      return routeRegistered;
    },
    run: () => {
      const ExpressRouter = require('express').Router();
      const routeEntries = Object.entries(routeRegistered);
      for (const [method, routes] of routeEntries) {
        for (const route of routes) {
          const middlewares = route.resolveMiddlewares();
          middlewares.push((req, res) => route.execute(req, res));
          ExpressRouter[method](route.uri, ...middlewares);
        }
      }

      return ExpressRouter;
    },
  };
}

module.exports = Router;
