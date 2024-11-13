import { _arr } from '@noravel/supporter';
import Paginator, { PaginatorOptions, initOptions } from './Paginator';
import UrlWindow from './UrlWindow';

export type UrlRange = {
  page: number;
  url: string;
};

export default class LengthAwarePaginator extends Paginator {
  public onEachSide: number = 1;
  public lastPage: number = 1;

  public constructor(
    items: any[],
    public total: number = 0,
    public perPage: number,
    currentPage: number = 1,
    options: PaginatorOptions = initOptions,
  ) {
    super(items, perPage, currentPage, options);
    this.lastPage = Math.ceil(total / perPage);
    this.setItems(items);
  }

  public setItems(items: any[]): void {
    if (items.length > this.perPage) {
      this.items = items.slice(this.currentPage * this.perPage - this.perPage, this.currentPage * this.perPage);
    } else {
      this.items = items;
    }
  }

  public setOnEachSide(value: number) {
    this.onEachSide = value;
  }

  public elements() {
    const elements = UrlWindow.make(this);

    return [
      elements.first,
      Array.isArray(elements.slider) ? '...' : null,
      elements.slider,
      Array.isArray(elements.last) ? '...' : null,
      elements.last,
    ].filter(item => item !== null);
  }

  public hasMorePages(): boolean {
    return this.currentPage < this.lastPage;
  }

  public getUrlRange(start: number, end: number): UrlRange[] | null {
    if (end <= start) {
      return null;
    }

    return _arr()
      .range(start, end)
      .map(page => {
        return {
          page,
          url: this.url(page),
          active: page == this.currentPage,
        };
      });
  }

  public jsonSerialize(): Record<string, unknown> {
    return {
      current_page: this.currentPage,
      data: this.items,
      first_page_url: this.url(1),
      from: this.firstItem(),
      next_page_url: this.nextPageUrl(),
      path: this.path,
      per_page: this.perPage,
      prev_page_url: this.previousPageUrl(),
      to: this.lastItem(),
      elements: this.elements(),
    };
  }
}
