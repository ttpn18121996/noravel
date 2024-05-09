import express from 'express';
import expressHandlebars from 'express-handlebars';
import ServiceProvider from './ServiceProvider.js';

export default class AppServiceProvider extends ServiceProvider {
  register() {
    // Register view engine
    this.app.engine(
      '.html',
      expressHandlebars.engine({
        extname: '.html',
        defaultLayout: this.container.getConfig('view.default_layout'),
      }),
    );
    this.app.set('view engine', '.html');
    this.app.set('views', this.container.getConfig('view.path'));

    // Register static files
    this.app.use(express.static('public'));

    this.container.bind('mysqlConnection', () => {
      return new (require('../../Database/MySqlConnection'))();
    });
    this.container.bind('Config', () => {
      return require('../Config')();
    });
  }
}
