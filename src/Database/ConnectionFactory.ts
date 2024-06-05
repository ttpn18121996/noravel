import { _obj } from 'tiny-supporter';
import Config from '../Foundation/Config';
import MySqlConnection from './MySqlConnection';
import PostgreSqlConnection from './PostgreSqlConnection';
import SqliteConnection from './SqliteConnection';
import Connection from './Connection';

type DriverConnection = {
  mysql: typeof Connection;
  postgres: typeof Connection;
  sqlite: typeof Connection;
};

export default class ConnectionFactory {
  private config = Config.getInstance().getConfig('database');

  public getConfig(key: string | null = null) {
    if (key) {
      return _obj.get(this.config, key);
    }

    return this.config;
  }

  public getDriver(key: string): Connection | null {
    const drivers = {
      mysql: MySqlConnection,
      postgres: PostgreSqlConnection,
      sqlite: SqliteConnection,
    } as DriverConnection;

    const driver = drivers?.[key as keyof DriverConnection];

    if (driver) {
      return new driver();
    }

    return null;
  }

  public getConnection(connectionName: string | null = null): Connection | null {
    connectionName = connectionName ?? this.getConfig('default');
    const driverName = _obj.get(this.config, `connections.${connectionName}.driver`);

    return this.getDriver(driverName);
  }
}
