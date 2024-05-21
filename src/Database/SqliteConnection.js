import sqlite3 from 'sqlite3';
import Connection from './Connection.js';
import Config from '../Foundation/Config.js';

export default class SqliteConnection extends Connection {
  constructor() {
    super();
    this.config = Config.getInstance().getConfig('database.connections.sqlite');
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
        if (err) {
          console.err('Execute query failed.')
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Insert a new record and get the value of the primary key.
   * @param {string} sql
   * @param {array} data
   * @param {function} callback
   * @returns Promise
   */
  async insertGetId(sql, data, callback) {
    const conn = await this.getConnection();

    return new Promise((resolve, reject) => {
      conn.run(sql, data, function (err) {
        resolve(callback(err, this.lastID));
      });

      conn.close();
    });
  }

  toSql() {
    return '';
  }
}
