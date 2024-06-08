import { _arr } from 'tiny-supporter';
import LengthAwarePaginator from './LengthAwarePaginator';

export default class UrlWindow {
  public first: number[] | null = null;
  public slider: number[] | null = null;
  public last: number[] | null = null;
  private static instance: UrlWindow;

  private constructor(public paginator: LengthAwarePaginator) {}

  public static make(paginator: LengthAwarePaginator) {
    if (!UrlWindow.instance) {
      UrlWindow.instance = new UrlWindow(paginator);
    }

    return UrlWindow.instance.get();
  }

  public get() {
    const onEachSide = this.paginator.onEachSide;

    if (this.paginator.lastPage < onEachSide * 2 + 8) {
      return this.getSmallSlider();
    }

    return this.getUrlSlider(onEachSide);
  }

  public getSmallSlider() {
    return {
      first: this.paginator.getUrlRange(1, this.paginator.lastPage),
      slider: null,
      last: null,
    };
  }

  public getUrlSlider(onEachSide: number) {
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
