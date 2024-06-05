import session, { SessionOptions } from 'express-session';
import ServiceProvider from '../Foundation/Providers/ServiceProvider';
import { _obj } from 'tiny-supporter';

export default class SessionServiceProvider extends ServiceProvider {
  override register() {
    const expireOnClose = this.container.getConfig('session.expire_on_close') || false;
    const sessionOptions = {
      secret: this.container.getConfig('app.key'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: undefined,
      },
    } as SessionOptions;

    if (expireOnClose) {
      _obj.set(sessionOptions, 'cookie.maxAge', parseInt(this.container.getConfig('session.lifetime')) * 60 * 1000);
    }

    this.app.use(session(sessionOptions));
  }
}
