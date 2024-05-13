export default class Middleware {
  constructor() {
    this.middlewares = {};
    this.groups = {
      web: [],
    };
  }

  alias(middlewares) {
    this.middlewares = { ...this.middlewares, ...middlewares };
  }

  appendTo(groupName, middlewares) {
    this.groups?.[groupName]?.concat(middlewares);

    return this;
  }
}
