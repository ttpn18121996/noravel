import { _obj } from 'tiny-supporter';

const Config = (function () {
  let instance;

  function init() {
    const configs = {};

    return {
      loadConfig(loaders = {}) {
        const loaderEntries = Object.entries(loaders);
        for (const [key, loader] of loaderEntries) {
          configs[key] = loader;
        }
    
        return this;
      },
      getConfig(key = null, defaultValue = null) {
        if (key === null || key === undefined || key === '') {
          return configs;
        }
        return _obj.get(configs, key, defaultValue);
      },
    }
  }

  return {
    getInstance() {
      if (!instance) {
        instance = init();
      }
      return instance;
    },
  };
})();

export default Config;
