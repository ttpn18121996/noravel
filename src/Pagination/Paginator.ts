import { _obj } from "tiny-supporter";

export type PaginatorOptions = {
  path: string;
  query: any;
  fragment: any;
  pageName: string;
};

const initOptions: PaginatorOptions = { path: '/', query: null, fragment: null, pageName: 'page' };

export default abstract class Paginator {
  public options: PaginatorOptions;
  public path: string;

  public constructor(
    items: any[],
    public perPage: number,
    public currentPage: number = 1,
    options: PaginatorOptions = initOptions,
  ) {
    this.options = { ...initOptions, ...options };
    this.path = _obj.get(this.options, 'path', '');
  }

  abstract setItems(items: any[]): void
}
