export default class Middleware {
  constructor() {
    this.middlewares = [];
    this.groups = {
      web: [],
    };
  }

  appendTo(groupName, middlewares) {
    this.groups?.[groupName]?.concat(middlewares);

    return this;
  }
}
