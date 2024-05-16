import Router from "./Router";

export default class RouteGroup {
  constructor(options = { middleware: [], prefix: '' }, callback) {
    this.options = options;
    this.callback = callback;
  }

  execute() {
    this.callback();
  }
}
