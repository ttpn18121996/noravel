export default class ServiceProvider {
  constructor(app) {
    this.app = app.server;
    this.baseDir = app.baseDir;
    this.container = app.container;
    this.registeredRoutes = app.registeredRoutes;
  }

  getBaseDir(path = '') {
    return this.baseDir + path.replace(/^\//, '');
  }

  register() {}

  boot() {}
}
