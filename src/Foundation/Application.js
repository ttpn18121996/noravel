'use strict';

const express = require('express');
const { _obj } = require('tiny-supporter');
const Container = require('./Container');
const Config = require('./Config');
const RootAppServiceProvider = require('./Providers/AppServiceProvider');

const Application = function ({ baseDir = '/', configs = [] }) {
  const server = express();
  const config = Config().loadConfig(configs);
  const registeredProviders = [];
  const registeredRoutes = [];
  const registeredMiddlewares = [];
  const container = Container.getInstance();
  container.setBaseDir(baseDir);

  function getBaseDir(path) {
    return baseDir + path.replace(/^\//, '');
  }

  function withRouting(routes) {
    const routesEntries = Object.entries(routes);

    for (const [prefix, route] of routesEntries) {
      registeredRoutes.push({
        prefix,
        route,
      });
    }

    return this;
  }

  function withMiddleware(middlewares = []) {
    for (const middleware of middlewares) {
      registeredMiddlewares.push(middleware);
    }
    
    return this;
  }

  function registerServiceProviders() {
    const appConfig = config.getConfig('app');
    const providers = _obj.get(appConfig, 'providers', []);
    providers.push(RootAppServiceProvider);

    for (const serviceProvider of providers) {
      const serviceProviderInstance = new serviceProvider(server, baseDir, container);

      if (typeof serviceProviderInstance.register !== 'function') {
        throw new Error(serviceProviderInstance.constructor.name + ' has not defined the register method.');
      }

      serviceProviderInstance.register();
      registeredProviders.push(serviceProviderInstance);
    }
  }

  function bootServiceProviders() {
    for (const registeredProvider of registeredProviders) {
      if (typeof registeredProvider.boot !== 'function') {
        throw new Error(registeredProvider.constructor.name + ' has not defined the boot method.');
      }

      registeredProvider.boot();
    }
  }

  function create() {
    registerServiceProviders();

    return this;
  }

  function run() {
    bootServiceProviders();

    for (const route of registeredRoutes) {
      server.use(route.prefix, route.route);
    }

    return server;
  }

  return {
    server,
    container,
    getBaseDir,
    withRouting,
    withMiddleware,
    create,
    run,
  };
};

module.exports = Application;
