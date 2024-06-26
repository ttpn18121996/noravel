import Paginator from './Paginator';

export default class SimplePaginator extends Paginator {
  protected hasMore: boolean = false;

  public setItems(items: any[]) {
    this.hasMore = items.length > this.perPage;
    if (items.length > this.perPage) {
      this.items = items.slice(this.currentPage * this.perPage - this.perPage, this.currentPage * this.perPage);
    } else {
      this.items = items;
    }
  }

  public links(view?: string, data?: Record<string, unknown>) {
    return view;
  }

  public hasMorePages(): boolean {
    return this.hasMore;
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
    };
  }
}
