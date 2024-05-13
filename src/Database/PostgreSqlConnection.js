import pg from 'pg';
import Connection from './Connection.js';
import Config from '../Foundation/Config.js';

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

    return conn.execute(sql, data);
  }
}