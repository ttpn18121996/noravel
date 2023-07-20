const Container = (() => {
  let instance;
  const bound = {};

  return {
    getInstance() {
      if (!instance) {
        instance = this;
      }
      return instance;
    },

    bind(abstract, concrete) {
      bound[abstract] = concrete;
    },

    resolve(abstract, params = {}) {
      if (bound?.[abstract]) {
        const concrete = bound[abstract];
        if (!this.isConstructor(concrete)) {
          return concrete(this);
        }
        const dependencies = this.getParams(concrete);
        if (dependencies.length) {
          const instances = [];
          for (const dependency of dependencies) {
            instances.push(this.resolve(dependency, params));
          }
  
          return Reflect.construct(concrete, instances);
        }
        return new concrete();
      }
  
      return params?.[abstract];
    },

    isConstructor(func) {
      return typeof func === 'function' && !!func.prototype && func.prototype.constructor === func;
    },

    getParams(func) {
      const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
      const ARGUMENT_NAMES = /([^\s,]+)/g;
      const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  
      return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES) ?? [];
    },
  };
})()

module.exports = Container;
