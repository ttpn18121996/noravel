import { IRouter, NextFunction, Request, Response } from 'express-serve-static-core';
import { Router as ExpressRouter } from 'express';
import Route, { RouteAction } from './Route';
import { _obj } from 'tiny-supporter';
import { IFunctionalMiddleware, IMiddleware } from '../Foundation/Configuration/Middleware';
import RouteGroup, { RouterOption } from './RouteGroup';

const verbs = ['get', 'post', 'put', 'patch', 'delete', 'options'];

export type validMethod = (typeof verbs)[number];

export default class Router {
  private routeRegistered: Record<validMethod, Route[]> = {
    get: [],
    post: [],
    put: [],
    patch: [],
    delete: [],
    options: [],
  };

  private groupStack: RouterOption[] = [];

  public add(method: validMethod, uri: string, action: RouteAction): Route {
    const newRoute = new Route(method, this.getPrefix(uri), action);
    newRoute.middleware(this.getMiddlewares());

    if (this.routeRegistered?.[method.toLowerCase()]) {
      this.routeRegistered[method.toLowerCase()].push(newRoute);
    }

    return newRoute;
  }

  private getPrefix(uri: string): string {
    let prefix = '';
    uri = uri.replace(/\/{1}$/, '');

    if (uri === '') {
      uri = '/';
    }

    if (this.groupStack.length) {
      prefix += _obj.get(this.groupStack[this.groupStack.length - 1], 'prefix', '');
    }

    return prefix + uri;
  }

  private getMiddlewares(): (IMiddleware | IFunctionalMiddleware)[] {
    let middlewares: (IMiddleware | IFunctionalMiddleware)[] = [];

    if (this.groupStack.length) {
      middlewares = middlewares.concat(_obj.get(this.groupStack[this.groupStack.length - 1], 'middleware', []));
    }

    return middlewares;
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
    this.updateGroupStack(options);

    callback(this);
    
    this.groupStack.pop();
  }

  private updateGroupStack(options: RouterOption) {
    const groupGroup = new RouteGroup();

    if (this.groupStack.length) {
      this.groupStack.push(groupGroup.merge(options, this.groupStack[this.groupStack.length - 1]));
    } else {
      this.groupStack.push(groupGroup.setOptions(options));
    }
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
