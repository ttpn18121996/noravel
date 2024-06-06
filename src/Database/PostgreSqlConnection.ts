import pg, { PoolClient, QueryResult } from 'pg';
import Config from '../Foundation/Config';
import Connection from './Connection';
import { _obj } from 'tiny-supporter';

export default class PostgreSqlConnection extends Connection {
  protected config = Config.getInstance().getConfig('database.connections.postgres');
  protected connection: PoolClient | null = null;

  public async getConnection(): Promise<PoolClient> {
    if (!this.connection) {
      const { host, port, user, password, database } = this.config;
      const postgres = new pg.Pool({ host, port, user, password, database });
      this.connection = await postgres.connect();
    }

    return this.connection;
  }

  public async execute(sql: string, data: any[] = []): Promise<QueryResult> {
    const conn = await this.getConnection();
    const rows = await conn.query(sql, data);

    return rows;
  }

  /**
   * Insert a new record and get the value of the primary key.
   */
  public async insertGetId(sql: string, data: any[], callback: (err: Error | null, id?: number | null) => any) {
    const conn = await this.getConnection();

    return new Promise((resolve, reject) => {
      conn.query(sql, data, (err: Error, result: QueryResult) => {
        resolve(callback(err, _obj.get(result, 'rows.0.id', null)));
      });
    });
  }
}
