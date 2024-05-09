import { _obj } from 'tiny-supporter';
import Container from '../Foundation/Container.js';
import MySqlConnection from './MySqlConnection.js';
import PostgresConnection from './PostgresConnection.js';

export default class ConnectionFactory {
  getDriver(key = null) {
    const drivers = {
      mysql: MySqlConnection,
      postgres: PostgresConnection,
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
    const connectionInstance = new this.getDriver()[driver]();

    return connectionInstance.getConnection();
  }
}
