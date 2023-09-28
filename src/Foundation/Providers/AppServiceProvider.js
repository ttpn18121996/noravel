'use strict';

const ServiceProvider = require('./ServiceProvider');

class AppServiceProvider extends ServiceProvider {
  register() {
    this.container.bind('mysqlConnection', () => {
      return new (require('../../Database/MySqlConnection'))();
    });
    this.container.bind('Config', () => {
      return require('../Config')();
    })
  }
}

module.exports = AppServiceProvider;
