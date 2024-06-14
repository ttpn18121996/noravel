import { NextFunction, Request, Response } from 'express-serve-static-core';


export type IFunctionalMiddleware = (req: Request, res: Response, next: NextFunction) => Response;
export interface IMiddleware {
  new (): IMiddleware;
  handle: IFunctionalMiddleware;
}

export default class Middleware {
  private middlewares: Record<string, IMiddleware> = {};

  public alias(middlewares: Record<string, IMiddleware>) {
    this.middlewares = { ...this.middlewares, ...middlewares };
  }
}
