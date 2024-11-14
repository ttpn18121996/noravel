import { NextFunction, RequestHandler } from 'express-serve-static-core';
import { typeOf } from '@noravel/supporter';
import { validMethod } from './Router';
import { IFunctionalMiddleware, IMiddleware } from '../Foundation/Configuration/Middleware';
import { Request, Response } from '../Http';

export type RouteAction = [new () => Object, string] | RequestHandler;

export default class Route {
  private routeName: string | null = null;

  private controller: any;

  private action: string | null = null;

  private middlewares: (IMiddleware | IFunctionalMiddleware)[] = [];

  public constructor(
    public method: validMethod,
    public uri: string,
    action: RouteAction,
  ) {
    if (Array.isArray(action)) {
      this.controller = action[0];
      this.action = action[1];
    } else {
      this.controller = action;
    }
  }

  public middleware(middlewares: (IMiddleware | IFunctionalMiddleware)[]) {
    this.middlewares = this.middlewares.concat(middlewares);

    return this;
  }

  public name(name: string) {
    this.routeName = name;
  }

  public getName(): string | null {
    return this.routeName;
  }

  public resolveMiddlewares(): IFunctionalMiddleware[] {
    return this.middlewares.map(middleware => {
      if (typeOf(middleware) === 'constructor') {
        middleware = new (middleware as any)();
      }

      if (typeof (middleware as IMiddleware).handle === 'function') {
        return (middleware as IMiddleware).handle;
      }

      return middleware as IFunctionalMiddleware;
    });
  }

  public execute(req: Request, res: Response, next: NextFunction): Response {
    if (this.action === null && typeOf(this.controller) === 'function') {
      return this.controller(req, res, next);
    }

    return new this.controller()[this.action || 'index'](req, res, next);
  }
}
