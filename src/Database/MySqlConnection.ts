import mysql, { Connection as BaseConnection, QueryResult } from 'mysql2/promise';
import Config from '../Foundation/Config';
import Connection from './Connection';
import { _obj } from 'tiny-supporter';

export default class MySqlConnection extends Connection {
  protected config = Config.getInstance().getConfig('database.connections.mysql');
  protected connection: BaseConnection | null = null;

  public async getConnection(): Promise<BaseConnection> {
    if (!this.connection) {
      const { host, port, username, password, database } = this.config;
      this.connection = await mysql.createConnection({ host, port, user: username, password, database });
    }

    return this.connection;
  }

  public async execute(sql: string, data: any[] = []): Promise<QueryResult> {
    const conn = await this.getConnection();

    const [rows] = await conn.execute(sql, data);

    return rows;
  }

  public async insertGetId(sql: string, data: any[], callback: (err: Error | null, id?: number | null) => any) {
    const conn = await this.getConnection();
    const [rows] = await conn.execute(sql, data);

    return callback(null, _obj.get(rows, '0')?.insertId);
  }
}
