'use strict';

class ServiceProvider {
  constructor(app, baseDir, container) {
    this.app = app;
    this.baseDir = baseDir;
    this.container = container;
  }

  getBaseDir(path = '') {
    return this.baseDir + path.replace(/^\//, '');
  }

  register() {}

  boot() {}
}

module.exports = ServiceProvider;
