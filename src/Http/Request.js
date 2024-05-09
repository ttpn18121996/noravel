export default class Request {
  constructor(request) {
    this.request = request;
  }

  query(key = null, defaultValue = null) {
    const { query } = this.request;

    if (!key) {
      return query;
    }

    return query?.[key] ?? defaultValue;
  }

  post(key = null, defaultValue = null) {
    if (!key) {
      return this.postData;
    }

    return this.postData?.[key] ?? defaultValue;
  }

  route(key = null, defaultValue = null) {
    const { params } = this.request;

    if (!key) {
      return this.request.route;
    }

    return params?.[key] ?? defaultValue;
  }

  cookies(key = null, defaultValue = null) {
    const { cookies } = this.request;

    if (!key) {
      return cookies;
    }

    return cookies?.[key] ?? defaultValue;
  }
}
