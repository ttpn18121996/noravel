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
    if (routeRegistered?.[method.toLowerCase()]) {
      routeRegistered[method.toLowerCase()].push(new Route(uri, action));
    }
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
          ExpressRouter[method](route.uri, (req, res) => route.execute(req, res));
        }
      }

      return ExpressRouter;
    },
  };
}

module.exports = Router;
