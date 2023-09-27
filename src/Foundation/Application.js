'use strict';

const path = require('path');

const Application = function (app, base_dir) {
  const container = require('./Container').getInstance();
  const appConfig = require('./Config')().getConfig('app');
  const providers = appConfig?.providers ?? [];
  const serviceProviderRegistered = [];
  const basePath = (pathFile = '') => {
    return path.join(base_dir, pathFile);
  };

  const baseAppServiceProvider = new (require(`./Providers/AppServiceProvider`))(app, container);
  baseAppServiceProvider.register();
  serviceProviderRegistered.push(baseAppServiceProvider);

  for (const providerName of providers) {
    const provider = new (require(basePath(`app/Providers/${providerName}`)))(app, container);
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
    container,
    app,
  };
}

module.exports = Application;
