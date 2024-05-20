import { _arr, _obj } from 'tiny-supporter';

const initOptions = { path: '/', query: null, fragment: null, pageName: 'page' };

export default class Paginator {
  constructor(items, perPage, currentPage = 1, options = initOptions) {
    this.options = { ...initOptions, ...options };
    this.perPage = perPage;
    this.currentPage = currentPage ?? 1;
    this.path = _obj.get(this.options, 'path', '');
  }

  firstItem() {
    return this.items.length > 0 ? this.perPage * (this.currentPage - 1) : 0;
  }

  lastItem() {
    return this.items.length > 0 ? this.perPage * this.currentPage : 0;
  }

  nextPageUrl() {
    if (this.hasMorePages()) {
      return this.url(this.currentPage + 1);
    }

    return null;
  }

  previousPageUrl() {
    if (this.currentPage > 1) {
      return this.url(this.currentPage - 1);
    }

    return null;
  }

  getUrlRange(start, end) {
    if (end <= start) {
      return null;
    }

    return _arr()
      .range(start, end)
      .map(page => {
        return {
          page,
          url: this.url(page),
        };
      });
  }

  url(page) {
    if (page <= 0) {
      page = 1;
    }

    const url = new URL(this.path);
    url.searchParams.set(this.pageName, page);

    return url;
  }
}
