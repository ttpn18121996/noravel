'use strict';

const ServiceProvider = require('./ServiceProvider');

class AppServiceProvider extends ServiceProvider {
  register() {
    this.container.bind('mysqlConnection', () => {
      return new (require('../../Database/MySqlConnection'))();
    });
  }
}

module.exports = AppServiceProvider;
