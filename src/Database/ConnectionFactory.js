'use strict';

const { _obj } = require('tiny-supporter');
const Container = require('../Foundation/Container');

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
    const databaseConfig = Container.getConfig('database');
    connectionName = connectionName ?? _obj.get(databaseConfig, 'default');
    const driver = _obj.get(databaseConfig, `connections.${connectionName}.driver`);
    const connection = require(`./${this.getDriver(driver)}`);
    const connectionInstance = new connection();

    return connectionInstance.getConnection();
  }
};

module.exports = ConnectionFactory;
