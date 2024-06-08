import Paginator from './Paginator';

export default class SimplePaginator extends Paginator {
  protected hasMore: boolean = false;

  public setItems(items: any[]) {
    this.items = items;
    this.hasMore = items.length > this.perPage;
    this.items = this.items.slice(0, this.perPage);
  }

  public links(view?: string, data?: Record<string, unknown>) {
    return view;
  }

  public hasMorePages(): boolean {
    return this.hasMore;
  }

  public jsonSerialize() {
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

  public toJson() {
    return JSON.stringify(this.jsonSerialize());
  }
}
