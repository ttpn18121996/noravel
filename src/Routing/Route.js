'use strict';

class Route {
  constructor(uri, action) {
    this.uri = uri;
    if (Array.isArray(action)) {
      this.controller = action[0];
      this.action = action[1];
    } else {
      this.controller = action;
    }
  }

  execute(req, res) {
    if (!this.action) {
      return this.controller(req, res)
    }

    return new this.controller(req, res)[this.action]();
  }
}

module.exports = Route;
