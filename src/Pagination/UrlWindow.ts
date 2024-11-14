import { _arr } from '@noravel/supporter';
import LengthAwarePaginator, { UrlRange } from './LengthAwarePaginator';

export default class UrlWindow {
  public first: UrlRange[] | null = null;
  public slider: UrlRange[] | null = null;
  public last: UrlRange[] | null = null;

  private constructor(public paginator: LengthAwarePaginator) {}

  public static make(paginator: LengthAwarePaginator) {
    return new UrlWindow(paginator).get();
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
    const currentPage: number = this.paginator.currentPage;

    if (total <= 1) {
      return this;
    }

    this.first = _arr().range(1, total).get();

    const first = this.paginator.getUrlRange(1, 2);
    const last = this.paginator.getUrlRange(total - 1, total);

    if (currentPage <= window) {
      this.first = this.paginator.getUrlRange(1, window + onEachSide);
      this.last = last;
    } else if (currentPage > total - window) {
      this.first = first;
      this.last = this.paginator.getUrlRange(total - window - onEachSide + 1, total);
    } else {
      this.first = first;
      this.slider = this.paginator.getUrlRange(currentPage - onEachSide, currentPage + onEachSide);
      this.last = last;
    }

    return this;
  }
}
