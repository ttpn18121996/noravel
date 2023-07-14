'use strict';

const path = require('path');

const Application = function (app, base_dir) {
  const appConfig = require('./Config')().getConfig('app');
  const providers = appConfig?.providers ?? [];
  const serviceProviderRegistered = [];
  const basePath = (pathFile = '') => {
    return path.join(base_dir, pathFile);
  };

  for (const providerName of providers) {
    const provider = require(basePath(`app/Providers/${providerName}`))(app);
    provider.register();
    serviceProviderRegistered.push(provider);
  }

  return {
    basePath,
    run() {
      for (const serviceProvider of serviceProviderRegistered) {
        serviceProvider.boot();
      }
    },
  };
}

module.exports = Application;
