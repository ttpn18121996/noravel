import { NextFunction, Request, Response } from 'express-serve-static-core';

export interface IMiddleware {
  handle: (req: Request, res: Response, next: NextFunction) => Response;
}

export default class Middleware {
  private middlewares: Record<string, IMiddleware> = {};

  public alias(middlewares: Record<string, IMiddleware>) {
    this.middlewares = { ...this.middlewares, ...middlewares };
  }
}
