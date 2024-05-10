import mysql from 'mysql2';
import Connection from './Connection.js';
import Container from '../Foundation/Container.js';

export default class MySqlConnection extends Connection {
  constructor() {
    super();
    this.config = Container.getInstance().getConfig('database.connections.mysql');
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
}
