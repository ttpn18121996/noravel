import express from 'express';
import { _obj } from 'tiny-supporter';
import Container from './Container.js';
import Config from './Config.js';
import AppServiceProvider from './Providers/AppServiceProvider.js';
import RouteServiceProvider from './Providers/RouteServiceProvider.js';
import SessionServiceProvider from '../Session/SessionServiceProvider.js';
import Middleware from './Configuration/Middleware.js';

export default (function Application () {
  const server = express();
  let basePath;
  let config;
  const registeredProviders = [];
  const middleware = new Middleware();
  const container = Container.getInstance();

  function configure(data = { basePath: '/', configs: {} }) {
    basePath = data.basePath;

    config = Config.getInstance().loadConfig(data.configs);

    if (!config.getConfig('app.key')) {
      throw new Error('APP_KEY does not exist, please create APP_KEY in the .env file');
    }

    container.setBaseDir(basePath);
    container.setConfig(config);

    pushBaseServiceProvider();

    return this;
  }

  function getBasePath(path) {
    return basePath + path.replace(/^\//, '');
  }

  function pushBaseServiceProvider() {
    registeredProviders.push(new AppServiceProvider({ server, basePath, container }));
    registeredProviders.push(new SessionServiceProvider({ server, basePath, container }));
  }

  function withRouting(routes) {
    const routesEntries = Object.entries(routes);
    const routeServiceProviderInstance = new RouteServiceProvider({ server, basePath, container });
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

  function withMiddleware(callback) {
    callback(middleware);
    
    return this;
  }

  function makeServiceProvider() {
    const appConfig = config.getConfig('app');
    const providers = _obj.get(appConfig, 'providers', []);

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
