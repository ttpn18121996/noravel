import session from 'express-session';
import ServiceProvider from '../Foundation/Providers/ServiceProvider.js';

export default class SessionServiceProvider extends ServiceProvider {
  register() {
    const expireOnClose = this.container.getConfig('session.expire_on_close') || false;
    const sessionOptions = {
      secret: this.container.getConfig('app.key'),
      resave: false,
      saveUninitialized: false,
    };

    if (! expireOnClose) {
      sessionOptions.cookie.expires = false;
    } else {
      sessionOptions.cookie.maxAge = parseInt(this.container.getConfig('session.lifetime')) * 60 * 1000;
    }

    this.app.use(
      session(sessionOptions),
    );
  }
}
