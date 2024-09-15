import { _obj } from 'tiny-supporter';
import Config from '../Foundation/Config';

export type PaginatorOptions = {
  path?: string;
  baseUrl?: string;
  query?: any;
  fragment?: any;
  pageName?: string;
};

export const initOptions: PaginatorOptions = {
  path: '/',
  query: null,
  fragment: null,
  pageName: 'page',
};

export default abstract class Paginator {
  public options: PaginatorOptions;
  public path: string;
  public pageName: string;
  public currentPage: number;

  public constructor(
    public items: any[] = [],
    public perPage: number,
    currentPage: number = 1,
    options: PaginatorOptions = initOptions,
  ) {
    this.options = { ...initOptions, ...options };
    this.path = _obj.get(this.options, 'path', '/');
    this.pageName = _obj.get(this.options, 'pageName', 'page');
    this.currentPage = parseInt(`${currentPage}`);
  }

  abstract setItems(items: any[]): void;

  abstract hasMorePages(): boolean;

  abstract jsonSerialize(): Record<string, unknown>;

  public firstItem(): number {
    return this.items.length > 0 ? this.perPage * (this.currentPage - 1) : 0;
  }

  public lastItem(): number {
    return this.items.length > 0 ? this.perPage * this.currentPage : 0;
  }

  public nextPageUrl(): URL | null {
    if (this.hasMorePages()) {
      return this.url(this.currentPage + 1);
    }

    return null;
  }

  public previousPageUrl(): URL | null {
    if (this.currentPage > 1) {
      return this.url(this.currentPage - 1);
    }

    return null;
  }

  public url(page: number): URL {
    let base = Config.getInstance().getConfig('app.url', '');

    if (this.options.baseUrl) {
      base = this.options.baseUrl;
    }

    if (page <= 0) {
      page = 1;
    }

    const url = new URL(this.path, base);
    url.searchParams.set(this.pageName, `${page}`);

    return url;
  }

  public setOption(key: string, value: unknown) {
    _obj.set(this.options, key, value);

    return this;
  }

  public toJson(): string {
    return JSON.stringify(this.jsonSerialize());
  }
}
