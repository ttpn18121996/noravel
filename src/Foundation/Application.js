'use strict';

const express = require('express');
const { _obj } = require('tiny-supporter');
const Container = require('./Container');
const Config = require('./Config');
const RootAppServiceProvider = require('./Providers/AppServiceProvider');
const RootRouteServiceProvider = require('./Providers/RouteServiceProvider');

const Application = function ({ baseDir = '/', configs = [] }) {
  const server = express();
  const config = Config().loadConfig(configs);
  const registeredProviders = [];
  const registeredMiddlewares = [];
  const container = Container.getInstance();
  container.setBaseDir(baseDir);
  container.setConfig(config);

  function getBaseDir(path) {
    return baseDir + path.replace(/^\//, '');
  }

  function withRouting(routes) {
    const routesEntries = Object.entries(routes);
    const routeServiceProviderInstance = new RootRouteServiceProvider({ server, baseDir, container });
    const registeredRoutes = [];

    for (const [prefix, route] of routesEntries) {
      registeredRoutes.push({
        prefix,
        route,
      });
    }

    routeServiceProviderInstance.loadRoutes(registeredRoutes);
    registeredProviders.push(routeServiceProviderInstance);

    return this;
  }

  function withMiddleware(middlewares = []) {
    for (const middleware of middlewares) {
      registeredMiddlewares.push(middleware);
    }
    
    return this;
  }

  function makeServiceProvider() {
    const appConfig = config.getConfig('app');
    const providers = _obj.get(appConfig, 'providers', []);

    registeredProviders.push(new RootAppServiceProvider({ server, baseDir, container }));

    for (const serviceProvider of providers) {
      registeredProviders.push(new serviceProvider({ server, baseDir, container }));
    }
  }

  function registerServiceProviders() {
    for (const registeredProvider of registeredProviders) {
      if (typeof registeredProvider.register !== 'function') {
        throw new Error(registeredProvider.constructor.name + ' has not defined the register method.');
      }

      registeredProvider.register();
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
    makeServiceProvider();
    registerServiceProviders();

    return this;
  }

  function run() {
    bootServiceProviders();

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
