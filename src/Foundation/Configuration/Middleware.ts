import { Request, Response } from '../../Http';

export type IFunctionalMiddleware = (req: Request, res: Response) => void;
export interface IMiddleware {
  handle: IFunctionalMiddleware;
}

export default class Middleware {
  private middlewares: Record<string, Function> = {};

  public alias(middlewares: Record<string, Function>) {
    this.middlewares = { ...this.middlewares, ...middlewares };
  }
}
