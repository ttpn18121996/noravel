import { _obj } from "tiny-supporter";
import Route from "./Route";

export default class RouteRegistrar {
  constructor() {
    this.registered = {
      get: [],
      post: [],
      put: [],
      patch: [],
      delete: [],
      options: [],
    };
  }

  addRoute(method, uri, action, options = {}) {
    const uriWithPrefix = _obj.get(options, 'prefix', '') + uri;
    const newRoute = new Route(uriWithPrefix, action);
    newRoute.middleware(_obj.get(options, 'middleware', []));

    if (this.registered?.[method.toLowerCase()]) {
      this.registered[method.toLowerCase()].push(newRoute);
    }

    return newRoute;
  }
}
