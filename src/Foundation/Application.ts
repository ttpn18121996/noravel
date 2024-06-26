import express from 'express';
import { Express } from 'express-serve-static-core';
import Config, { DataConfig } from './Config';
import Container from './Container';
import ServiceProvider from './Providers/ServiceProvider';
import AppServiceProvider from './Providers/AppServiceProvider';
import SessionServiceProvider from '../Session/SessionServiceProvider';
import RouteServiceProvider, { type RegisteredRoute } from './Providers/RouteServiceProvider';
import Router from '../Routing/Router';
import Middleware from './Configuration/Middleware';
import { _obj } from 'tiny-supporter';

class Application {
  private basePath: string = '/';
  private server: Express = express();
  private config: Config = Config.getInstance();
  private container: Container = Container.getInstance();
  private registeredProviders: ServiceProvider[] = [];
  private middleware: Middleware = new Middleware();

  public configure(data: DataConfig = { basePath: '/', configs: {} }): this {
    this.basePath = data.basePath;
    this.config.loadConfig(data.configs);

    if (!this.config.getConfig('app.key')) {
      throw new Error('APP_KEY does not exist, please create APP_KEY in the .env file');
    }

    this.container.setBaseDir(this.basePath);
    this.container.setConfig(this.config);

    this.pushBaseServiceProvider();

    return this;
  }

  private pushBaseServiceProvider(): void {
    const serviceProviderProps = { server: this.server, baseDir: this.basePath, container: this.container };

    this.registeredProviders.push(new AppServiceProvider(serviceProviderProps));
    this.registeredProviders.push(new SessionServiceProvider(serviceProviderProps));
    this.registeredProviders.push(new RouteServiceProvider(serviceProviderProps));
  }

  public withRouting(routes: Record<string, Router>): this {
    const routeEntries = Object.entries(routes);
    const registeredRoutes: RegisteredRoute[] = [];

    for (const [prefix, route] of routeEntries) {
      registeredRoutes.push({
        prefix,
        route,
      });
    }

    const routeServiceProvider = this.registeredProviders.find(
      serviceProvider => serviceProvider.constructor.name === 'RouteServiceProvider',
    ) as RouteServiceProvider;
    routeServiceProvider.loadRoutes(registeredRoutes);

    return this;
  }

  public withMiddleware(callback: (middleware: Middleware) => void) {
    callback(this.middleware);

    return this;
  }

  public getBasePath(path: string = ''): string {
    return this.basePath + path.replace(/^\//, '');
  }

  public makeServiceProvider() {
    const appConfig = this.config.getConfig('app');
    const providers = _obj.get(appConfig, 'providers', []);

    for (const serviceProvider of providers) {
      this.registeredProviders.push(
        new serviceProvider({ server: this.server, baseDir: this.basePath, container: this.container }),
      );
    }
  }

  public registerServiceProvider(): void {
    for (const registeredProvider of this.registeredProviders) {
      if (typeof registeredProvider.register !== 'function') {
        throw new Error(registeredProvider.constructor.name + ' has not defined the register method.');
      }

      registeredProvider.register();
    }
  }

  public bootServiceProvider(): void {
    for (const registeredProvider of this.registeredProviders) {
      if (typeof registeredProvider.boot !== 'function') {
        throw new Error(registeredProvider.constructor.name + ' has not defined the boot method.');
      }

      registeredProvider.boot();
    }
  }

  public create() {
    this.makeServiceProvider();
    this.registerServiceProvider();

    return this;
  }

  public run() {
    this.bootServiceProvider();

    return this.server;
  }
}

export default new Application();
