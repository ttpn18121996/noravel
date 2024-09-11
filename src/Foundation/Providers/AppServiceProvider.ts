import express from 'express';
import { engine as expressHandlebarsEngine } from 'express-handlebars';
import ejs from 'ejs';
import ServiceProvider from './ServiceProvider';

export default class AppServiceProvider extends ServiceProvider {
  override register(): void {
    this.registerViews();
    this.registerStaticFile();
  }

  private registerViews() {
    const driver = this.container.getConfig('view.default', 'handlebars');
    const engine = this.container.getConfig('view.drivers.' + driver + '.engine');

    if (driver === 'handlebars') {
      this.app.engine(
        '.html',
        expressHandlebarsEngine({
          extname: '.html',
          defaultLayout: this.container.getConfig('view.default_layout', 'app'),
          layoutsDir: this.container.getConfig('view.layout_dir', 'resources/views/layouts'),
          partialsDir: this.container.getConfig('view.partials_dir', 'resources/views/partials'),
        }),
      );
    } else if (driver === 'ejs') {
      ejs.delimiter = this.container.getConfig('view.drivers.ejs.delimiters', '%');
    }

    this.app.set('view engine', engine);
    this.app.set('views', this.container.getConfig('view.path'));
  }

  private registerStaticFile() {
    this.app.use(express.static('public'));
  }
}
