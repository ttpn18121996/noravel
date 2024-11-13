import { _obj } from '@noravel/supporter';
import { IFunctionalMiddleware, IMiddleware } from '../Foundation/Configuration/Middleware';

export type RouterOption = {
  middleware?: (IMiddleware | IFunctionalMiddleware)[];
  prefix?: string;
};

export default class RouteGroup {
  public constructor(
    public prefix: string = '',
    public middleware: (IMiddleware | IFunctionalMiddleware)[] = [],
  ) {}

  public setOptions(options: RouterOption) {
    this.prefix = options.prefix ?? '';
    this.middleware = options?.middleware ?? [];

    return this;
  }

  public merge(newData: RouterOption, oldData: RouterOption) {
    this.prefix = (oldData?.prefix ?? '') + (newData?.prefix ?? '');
    this.middleware = (oldData?.middleware ?? []).concat(newData?.middleware ?? []);

    return this;
  }

  public toOption(): RouterOption {
    return {
      prefix: this.prefix,
      middleware: this.middleware,
    };
  }
}
