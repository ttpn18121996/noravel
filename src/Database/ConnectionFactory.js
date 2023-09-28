'use strict';

const { _obj } = require('../Support/helpers');

class ConnectionFactory {
  getDriver(key = null) {
    const drivers = {
      mysql: 'MySqlConnection',
      postgres: 'PostgresConnection',
    };

    if (key) {
      return drivers?.[key];
    }

    return drivers;
  }

  getConnection(connectionName) {
    const databaseConfig = require('../Foundation/Config')().getConfig('database');
    const connectionName = connectionName ?? _obj.get(databaseConfig, 'default');
    const driver = _obj.get(databaseConfig, `connections.${connectionName}.driver`);

    return require(`./${this.getDriver(driver)}`);
  }
};

module.exports = ConnectionFactory;
