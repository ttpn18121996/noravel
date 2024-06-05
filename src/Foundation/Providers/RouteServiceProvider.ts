import express from 'express';
import ServiceProvider from './ServiceProvider';
import Router from '../../Routing/Router';
import Middleware from '../Configuration/Middleware';

export type RegisteredRoute = { prefix: string; route: Router };

export default class RouteServiceProvider extends ServiceProvider {
  private registeredRoutes: RegisteredRoute[] = [];
  private middleware: Middleware | null = null;

  public loadRoutes(routes: RegisteredRoute[]) {
    this.registeredRoutes = routes;
  }

  public registerMiddleware(middleware: Middleware) {
    this.middleware = middleware;
  }

  override register(): void {
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));

      for (const route of this.registeredRoutes) {
        this.app.use(route.prefix, route.route.run());
      }
  }
}
