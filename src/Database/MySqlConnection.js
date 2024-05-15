import mysql from 'mysql2';
import Connection from './Connection.js';
import Config from '../Foundation/Config.js';
import { _obj } from 'tiny-supporter';

export default class MySqlConnection extends Connection {
  constructor() {
    super();
    this.config = Config.getInstance().getConfig('database.connections.mysql');
  }

  async getConnection() {
    if (!this.connection) {
      const { host, port, username, password, database } = this.config;
      this.connection = await mysql.createConnectionPromise({ host, port, user: username, password, database });
    }

    this.connection.connect(err => {
      if (err) {
        console.log(`Error connecting: ${err}`);
        return;
      }

      console.log(this.constructor.name + ' connection successful! ' + this.connection.threadId);
    });

    return this.connection;
  }

  async execute(sql, data = []) {
    const conn = await this.getConnection();

    const [rows] = await conn.execute(sql, data);

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
    const [rows] = await conn.execute(sql, data);

    return callback(null, _obj.get(rows, '0')?.insertId);
  }
}
