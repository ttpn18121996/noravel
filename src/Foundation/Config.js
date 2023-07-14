'use strict';

const path = require('path');
const fs = require('fs');
const { _obj } = require('../Support/helpers');

function Config() {
  const configs = {};
  const files = fs.readdirSync(path.resolve('config'));

  for (const file of files) {
    const key = file.replace(/\.js$/i, '');
    configs[key] = require(path.resolve('config', file));
  }

  return {
    getConfig(key = null) {
      if (key === null || key === undefined || key === '') {
        return configs;
      }
      return _obj.get(configs, key);
    },
  };
};

module.exports = Config;
