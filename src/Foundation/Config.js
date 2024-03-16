'use strict';

const { _obj } = require('tiny-supporter');

const Config = function () {
  const configs = {};

  function loadConfig(loaders = {}) {
    const loaderEntries = Object.entries(loaders);
    for (const [key, loader] of loaderEntries) {
      configs[key] = loader;
    }

    return this;
  }

  return {
    loadConfig,
    getConfig(key = null) {
      if (key === null || key === undefined || key === '') {
        return configs;
      }
      return _obj.get(configs, key);
    },
  };
};

module.exports = Config;
