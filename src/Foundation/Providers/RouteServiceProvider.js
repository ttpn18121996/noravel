import express from 'express';
import ServiceProvider from './ServiceProvider.js';
import { _obj } from 'tiny-supporter';

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
      this.app.use(route.prefix, route.route.run());
    }
  }

  boot() {
    this.customRequest();
    this.customResponse();

    this.app.use((req, res) => {
      return res.status(404).render('errors/404', { layout: 'error' });
    });
  }

  customRequest() {
    this.app.request.getQuery = function (key = null, defaultValue = null) {
      if (!key) {
        return this.query;
      }

      return _obj.get(this.query, key, defaultValue);
    };
    
    this.app.request.getPost = function (key = null, defaultValue = null) {
      if (!key) {
        return this.body;
      }

      return _obj.get(this.body, key, defaultValue);
    };
    
    this.app.request.getInput = function (key = null, defaultValue = null) {
      const input = { ...this.query, ...this.body };
      if (!key) {
        return input;
      }

      return _obj.get(input, key, defaultValue);
    };

    this.app.request.getParam = function (key = null, defaultValue = null) {
      if (!key) {
        return this.params;
      }

      return _obj.get(this.params, key, defaultValue);
    };
  }

  customResponse() {
    this.app.response.view = function (...args) {
      return this.render(...args);
    };

    this.app.response.abort = function (status = 400, message = 'Bad request') {
      return this.status(status).render('errors/error', { layout: 'error', message, code: status });
    };
  }
}
