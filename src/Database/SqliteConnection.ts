import sqlite3, { type Database as IDatabase } from 'sqlite3';
import Config from '../Foundation/Config';
import Connection from './Connection';

export default class SqliteConnection extends Connection {
  protected config = Config.getInstance().getConfig('database.connections.sqlite');
  protected connection: IDatabase | null = null;

  public getConnection() {
    if (!this.connection) {
      const { database } = this.config;
      this.connection = new sqlite3.Database(database, err => {
        if (err) {
          console.log(`Error connecting: ${err}`);
        }
      });
    }

    return this.connection;
  }

  public execute(sql: string, data: any[] = []): Promise<unknown[]> {
    const conn = this.getConnection();

    return new Promise((resolve, reject) => {
      conn.all(sql, data, (err, rows) => {
        if (err) {
          console.log('Execute query failed.');
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}
