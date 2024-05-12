import express from 'express';
import ServiceProvider from './ServiceProvider.js';

export default class RouteServiceProvider extends ServiceProvider {
  constructor(app) {
    super(app);
    this.registeredRoutes = [];
  }

  loadRoutes(routes) {
    this.registeredRoutes = routes;
  }

  register() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }))

    for (const route of this.registeredRoutes) {
      this.app.use(route.prefix, route.route);
    }
  }

  boot() {
    this.app.request.getQuery = function (key = null, defaultValue = null) {
      if (!key) {
        return this.query;
      }

      return this.query?.[key] ?? defaultValue;
    };
    
    this.app.request.getPost = function (key = null, defaultValue = null) {
      if (!key) {
        return this.body;
      }

      return this.body?.[key] ?? defaultValue;
    };
    
    this.app.request.getInput = function (key = null, defaultValue = null) {
      const input = { ...this.query, ...this.body };
      if (!key) {
        return input;
      }

      return input?.[key] ?? defaultValue;
    };

    this.app.response.view = function (...args) {
      return this.render(...args);
    };

    this.app.use((req, res) => {
      return res.status(404).render('errors/404', { layout: 'error' });
    });
  }
}
