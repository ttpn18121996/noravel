import { IRouter, NextFunction, Request, Response } from 'express-serve-static-core';
import { Router as ExpressRouter } from 'express';
import Route, { RouteAction } from './Route';
import { _obj } from 'tiny-supporter';

const verbs = ['get', 'post', 'put', 'patch', 'delete', 'options'];

type validMethod = (typeof verbs)[number];

type RouterOption = {
  middleware: [];
  prefix: string;
};

export default class Router {
  private routeRegistered: Record<validMethod, Route[]> = {
    get: [],
    post: [],
    put: [],
    patch: [],
    delete: [],
    options: [],
  };

  private routeOptions: RouterOption = { middleware: [], prefix: '' };

  public add(method: validMethod, uri: string, action: RouteAction): Route {
    const uriWithPrefix = _obj.get(this.routeOptions, 'prefix', '') + uri;
    const newRoute = new Route(uriWithPrefix, action);

    if (this.routeRegistered?.[method.toLowerCase()]) {
      this.routeRegistered[method.toLowerCase()].push(newRoute);
    }

    return newRoute;
  }

  public get(uri: string, action: RouteAction): Route {
    return this.add('get', uri, action);
  }

  public post(uri: string, action: RouteAction): Route {
    return this.add('post', uri, action);
  }

  public put(uri: string, action: RouteAction): Route {
    return this.add('put', uri, action);
  }

  public patch(uri: string, action: RouteAction): Route {
    return this.add('patch', uri, action);
  }

  public delete(uri: string, action: RouteAction): Route {
    return this.add('delete', uri, action);
  }

  public options(uri: string, action: RouteAction): Route {
    return this.add('options', uri, action);
  }

  public group(options: RouterOption, callback: Function) {
    this.routeOptions = { ...this.routeOptions, ...options };
    callback();
    this.routeOptions = {
      middleware: [],
      prefix: '',
    };
  }

  public run(): IRouter {
    const router = ExpressRouter();
    const routeEntries = Object.entries(this.routeRegistered);

    for (const [method, routes] of routeEntries) {
      for (const route of routes) {
        const middlewares = route.resolveMiddlewares();
        middlewares.push((req: Request, res: Response, next: NextFunction) => route.execute(req, res, next));
        (router[method as keyof ExpressRouter] as Function)(route.uri, ...middlewares);
      }
    }

    return router;
  }
}
