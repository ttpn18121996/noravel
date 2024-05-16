import express from 'express';
import expressHandlebars from 'express-handlebars';
import ServiceProvider from './ServiceProvider.js';
import MySqlConnection from '../../Database/MySqlConnection.js';
import Config from '../Config.js';

export default class AppServiceProvider extends ServiceProvider {
  register() {
    this.registerViews();
    this.registerStaticFiles();
  }

  registerViews() {
    this.app.engine(
      '.html',
      expressHandlebars.engine({
        extname: '.html',
        defaultLayout: this.container.getConfig('view.default_layout', 'app'),
        layoutsDir: this.container.getConfig('view.layout_dir', 'resources/views/layouts'),
        partialsDir: this.container.getConfig('view.partials_dir', ['resources/views/partials']),
      }),
    );
    this.app.set('view engine', '.html');
    this.app.set('views', this.container.getConfig('view.path'));
  }

  registerStaticFiles() {
    this.app.use(express.static('public'));
  }
}
