import pg from 'pg';
import Connection from './Connection.js';
import Config from '../Foundation/Config.js';
import { _obj } from 'tiny-supporter';

export default class PostgreSqlConnection extends Connection {
  constructor() {
    super();
    this.config = Config.getInstance().getConfig('database.connections.postgres');
  }

  async getConnection() {
    if (!this.connection) {
      const { host, port, user, password, database } = this.config;
      const postgres = new pg.Pool({ host, port, user, password, database });
      this.connection = await postgres.connect();
    }

    return this.connection;
  }

  async execute(sql, data = []) {
    const conn = await this.getConnection();
    const rows = await conn.query(sql, data);

    return rows;
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
      conn.query(sql, data, function (err, result) {
        resolve(callback(err, _obj.get(result, 'rows.0.id', null)));
      });
    });
  }
}
