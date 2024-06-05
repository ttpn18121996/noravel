import express from 'express';
import ExpressHandlebars from 'express-handlebars';
import ServiceProvider from './ServiceProvider';

export default class AppServiceProvider extends ServiceProvider {
  override register() {
    this.registerViews();
    this.registerStaticFile();
  }

  private registerViews() {
    this.app.engine(
      '.html',
      ExpressHandlebars.engine({
        extname: '.html',
        defaultLayout: this.container.getConfig('view.default_layout', 'app'),
        layoutsDir: this.container.getConfig('view.layout_dir', 'resources/views/layouts'),
        partialsDir: this.container.getConfig('view.partials_dir', 'resources/views/partials'),
      }),
    );
    this.app.set('view engine', '.html');
    this.app.set('views', this.container.getConfig('view.path'));
  }

  private registerStaticFile() {
    this.app.use(express.static('public'));
  }
}
