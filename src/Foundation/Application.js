import express from 'express';
import { _obj } from 'tiny-supporter';
import Container from './Container.js';
import Config from './Config.js';
import RootAppServiceProvider from './Providers/AppServiceProvider.js';
import RootRouteServiceProvider from './Providers/RouteServiceProvider.js';

export default (function Application () {
  const server = express();
  let basePath;
  let config;
  const registeredProviders = [];
  const registeredMiddlewares = [];
  const container = Container.getInstance();

  function configure(data = { basePath: '/', configs: {} }) {
    basePath = data.basePath;

    config = Config().loadConfig(data.configs);

    container.setBaseDir(basePath);
    container.setConfig(config);

    return this;
  }

  function getBasePath(path) {
    return basePath + path.replace(/^\//, '');
  }

  function withRouting(routes) {
    const routesEntries = Object.entries(routes);
    const routeServiceProviderInstance = new RootRouteServiceProvider({ server, basePath, container });
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

    registeredProviders.push(new RootAppServiceProvider({ server, basePath, container }));

    for (const serviceProvider of providers) {
      registeredProviders.push(new serviceProvider({ server, basePath, container }));
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
    configure,
    getBasePath,
    withRouting,
    withMiddleware,
    create,
    run,
  };
})();
