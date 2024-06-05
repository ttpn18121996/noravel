import { NextFunction, Request, RequestHandler, Response } from 'express-serve-static-core';
import { _obj, typeOf } from 'tiny-supporter';

export type RouteAction = [new () => Object, string] | RequestHandler;

export default class Route {
  private routeName: string | null = null;

  private controller: any;

  private action: string | null = null;

  public constructor(public uri: string, action: RouteAction) {
    if (Array.isArray(action)) {
      this.controller = action[0];
      this.action = action[1];
    } else {
      this.controller = action;
    }
  }

  public name(name: string) {
    this.routeName = name;
  }

  public getName(): string | null {
    return this.routeName;
  }

  public resolveMiddlewares(): any[] {
    return [];
  }

  public execute(req: Request, res: Response, next: NextFunction): Response {
    if (this.action === null && typeOf(this.controller) === 'function') {
      return this.controller(req, res, next);
    }

    return new (this.controller)()[this.action || 'index'](req, res, next);
  }
}
