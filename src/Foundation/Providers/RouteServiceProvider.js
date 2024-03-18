const ServiceProvider = require('./ServiceProvider');

class RouteServiceProvider extends ServiceProvider {
  constructor(app) {
    super(app);
    this.registeredRoutes = [];
  }

  loadRoutes(routes) {
    this.registeredRoutes = routes;
  }

  register() {
    for (const route of this.registeredRoutes) {
      this.app.use(route.prefix, route.route);
    }
  }

  boot() {
    this.app.use((req, res) => {
      return res.status(404).render('errors/404', { layout: 'error' });
    });
  }
}

module.exports = RouteServiceProvider;
