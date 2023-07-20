'use strict';

class ServiceProvider {
  constructor(app, container) {
    this.app = app;
    this.container = container;
  }

  register() {}

  boot() {}
}

module.exports = ServiceProvider;
