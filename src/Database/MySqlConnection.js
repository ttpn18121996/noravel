import mysql from 'mysql2';
import Connection from './Connection.js';
import Container from '../Foundation/Container.js';

export default class MySqlConnection extends Connection {
  constructor() {
    super();
    this.config = Container.getConfig('database.connections.mysql');
  }

  async getConnection() {
    if (!this.connection) {
      const { host, port, username, password, database } = this.config;
      this.connection = await mysql.createConnectionPromise({ host, port, user: username, password, database });
    }

    this.checkConnection();

    return this.connection;
  }
}
