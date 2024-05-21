import { _obj } from "tiny-supporter";
import Paginator from "./Paginator.js";

export default class SimplePaginator extends Paginator {
  constructor(items, perPage, currentPage = 1, options = { path: '/', query: null, fragment: null, pageName: 'page' }) {
    super(items, perPage, currentPage, options);
    this.setItems(items);
  }

  setItems(items) {
    this.items = items;
    this.hasMore = items.length > this.perPage;
    this.items = this.items.slice(0, this.perPage);
  }

  links(view = null, data = null) {
    return view;
  }

  hasMorePages() {
    return this.hasMore;
  }

  jsonSerialize() {
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

  toJson() {
    return JSON.stringify(this.jsonSerialize());
  }
}
