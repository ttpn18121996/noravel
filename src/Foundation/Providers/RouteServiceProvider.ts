import express from 'express';
import ServiceProvider from './ServiceProvider';
import Router from '../../Routing/Router';
import Middleware from '../Configuration/Middleware';
import { _obj } from '@noravel/supporter';

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

    this.customRequest();
    this.customResponse();
  }

  override boot(): void {
    for (const route of this.registeredRoutes) {
      this.app.use(route.prefix, route.route.run());
    }
  }

  private customRequest() {
    this.app.request.getQuery = function (key: string | null = null, defaultValue: any = null) {
      if (!key) {
        return this.query;
      }

      return _obj.get(this.query, key, defaultValue);
    };

    this.app.request.getPost = function (key: string | null = null, defaultValue: any = null) {
      if (!key) {
        return this.body;
      }

      return _obj.get(this.body, key, defaultValue);
    };

    this.app.request.getInput = function (key: string | null = null, defaultValue: any = null) {
      const input = { ...this.query, ...this.body };
      if (!key) {
        return input;
      }

      return _obj.get(input, key, defaultValue);
    };

    this.app.request.getParam = function (key: string | null = null, defaultValue: any = null) {
      if (!key) {
        return this.params;
      }

      return _obj.get(this.params, key, defaultValue);
    };
  }

  private customResponse() {
    const viewShared = this.view.get();
    this.app.response.view = function (
      view: string,
      options?: Object | undefined,
      callback?: ((err: Error, html: string) => void) | undefined,
    ) {
      const newOptions = { ...viewShared, ...options };
      return this.render(view, newOptions, callback);
    };

    this.app.response.abort = function (status = 400, message = 'Bad request') {
      return this.status(status).render('errors/error', { layout: 'error', message, code: status });
    };
  }
}
