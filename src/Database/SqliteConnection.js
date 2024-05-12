import sqlite3 from 'sqlite3';
import Connection from './Connection.js';
import Container from '../Foundation/Container.js';

export default class SqliteConnection extends Connection {
  constructor() {
    super();
    this.config = Container.getInstance().getConfig('database.connections.sqlite');
  }

  async getConnection() {
    if (!this.connection) {
      const { database } = this.config;
      this.connection = await new sqlite3.Database(database, err => {
        if (err) {
          console.log(`Error connecting: ${err}`);
        }
      });
    }

    return this.connection;
  }

  async execute(sql, data = []) {
    const conn = await this.getConnection();

    return new Promise((resolve, reject) => {
      conn.all(sql, data, (err, rows) => {
        resolve(rows);
      });

      conn.close();
    });
  }

  toSql() {
    return '';
  }
}
