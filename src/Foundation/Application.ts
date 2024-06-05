import express from 'express';
import { Express, Router } from 'express-serve-static-core';
import Config, { DataConfig } from './Config';
import Container from './Container';
import type ServiceProvider from './Providers/ServiceProvider';
import AppServiceProvider from './Providers/AppServiceProvider';
import SessionServiceProvider from '../Session/SessionServiceProvider';
import RouteServiceProvider from './Providers/RouteServiceProvider';

class Application {
  private basePath: string = '/';
  private server: Express = express();
  private config: Config = Config.getInstance;
  private container: Container = Container.getInstance;
  private registeredProviders: ServiceProvider[] = [];

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
  }

  public withRouting(routes: { [key: string]: Router }) {
    const routeEntries = Object.entries(routes);
    const routeServiceProvider = new RouteServiceProvider({ server: this.server, baseDir: this.basePath, container: this.container });
  }

  public getBasePath() {}
}

export default new Application();
