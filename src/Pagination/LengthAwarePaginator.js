import Paginator from './Paginator.js';
import UrlWindow from './UrlWindow.js';

export default class LengthAwarePaginator extends Paginator {
  constructor(
    items,
    total,
    perPage,
    currentPage = 1,
    options = { path: '/', query: null, fragment: null, pageName: 'page' },
  ) {
    super(items, perPage, currentPage, options);
    this.total = total;
    this.lastPage = Math.ceil(total / perPage);
    this.items = items;
    this.onEachSide = 1;
  }

  setOnEachSide(value) {
    this.onEachSide = value;
  }

  elements() {
    const elements = UrlWindow.make(this);

    return [
      elements.first,
      Array.isArray(elements.slider) ? '...' : null,
      elements.slider,
      Array.isArray(elements.last) ? '...' : null,
      elements.last,
    ].filter(item => item !== null);
  }

  hasMorePages() {
    return this.currentPage < this.lastPage;
  }
}
