import { _arr } from 'tiny-supporter';

class UrlWindow {
  constructor(paginator) {
    this.paginator = paginator;
    this.first = null;
    this.silder = null;
    this.last = null;
  }

  get() {
    const onEachSide = this.paginator.onEachSide;

    if (this.paginator.lastPage < onEachSide * 2 + 8) {
      return this.getSmallSlider();
    }

    return this.getUrlSlider(onEachSide);
  }

  getSmallSlider() {
    return {
      first: this.paginator.getUrlRange(1, this.paginator.lastPage),
      slider: null,
      last: null,
    };
  }

  getUrlSlider(onEachSide) {
    const window = onEachSide + 4;
    const total = this.paginator.total;
    const currentPage = this.paginator.currentPage;

    if (total <= 1) {
      return this;
    }

    this.first = _arr().range(1, total).get();

    const first = [1, 2];
    const last = [total - 1, total];

    if (currentPage <= window) {
      this.first = _arr()
        .range(1, window + onEachSide)
        .get();
      this.last = last;
    } else if (currentPage > total - window) {
      this.first = first;
      this.last = _arr()
        .range(total - window - onEachSide + 1, total)
        .get();
    } else {
      this.first = first;
      this.slider = _arr()
        .range(currentPage - onEachSide, currentPage + onEachSide)
        .get();
      this.last = last;
    }

    return this;
  }
}

export default (() => {
  let urlWindow;

  return {
    make(paginator) {
      if (!urlWindow) {
        urlWindow = new UrlWindow(paginator);
      }

      return urlWindow.get();
    },
  };
})();
