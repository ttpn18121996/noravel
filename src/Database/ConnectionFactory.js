import { _obj } from 'tiny-supporter';
import Container from '../Foundation/Container.js';
import MySqlConnection from './MySqlConnection.js';
import PostgreSqlConnection from './PostgreSqlConnection.js';
import SqliteConnection from './SqliteConnection.js';

export default class ConnectionFactory {
  constructor() {
    this.config = Container.getInstance().getConfig('database');
  }

  getConfig(key = null) {
    if (key) {
      return _obj.get(this.config, key);
    }

    return this.config;
  }

  getDriver(key = null) {
    const drivers = {
      mysql: MySqlConnection,
      postgres: PostgreSqlConnection,
      sqlite: SqliteConnection,
    };

    if (key) {
      return drivers?.[key];
    }

    return drivers;
  }

  getConnection(connectionName) {
    connectionName = connectionName ?? this.getConfig('default');
    const driver = _obj.get(this.config, `connections.${connectionName}.driver`);
    const connectionInstance = new (this.getDriver()[driver])();

    return connectionInstance;
  }
}
