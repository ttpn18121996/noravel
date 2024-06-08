import { _obj } from "tiny-supporter";

export type PaginatorOptions = {
  path?: string;
  query?: any;
  fragment?: any;
  pageName?: string;
};

export const initOptions: PaginatorOptions = { path: '/', query: null, fragment: null, pageName: 'page' };

export default abstract class Paginator {
  public options: PaginatorOptions;
  public path: string;
  public pageName: string;

  public constructor(
    public items: any[] = [],
    public perPage: number,
    public currentPage: number = 1,
    options: PaginatorOptions = initOptions,
  ) {
    this.options = { ...initOptions, ...options };
    this.path = _obj.get(this.options, 'path', '');
    this.pageName = _obj.get(this.options, 'pageName', 'page');
  }

  abstract setItems(items: any[]): void

  abstract hasMorePages(): boolean;

  public firstItem() {
    return this.items.length > 0 ? this.perPage * (this.currentPage - 1) : 0;
  }

  public lastItem() {
    return this.items.length > 0 ? this.perPage * this.currentPage : 0;
  }

  public nextPageUrl() {
    if (this.hasMorePages()) {
      return this.url(this.currentPage + 1);
    }

    return null;
  }

  public previousPageUrl() {
    if (this.currentPage > 1) {
      return this.url(this.currentPage - 1);
    }

    return null;
  }

  public url(page: number) {
    if (page <= 0) {
      page = 1;
    }

    const url = new URL(this.path);
    url.searchParams.set(this.pageName, `${page}`);

    return url;
  }
}
