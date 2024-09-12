import pg, { PoolClient, QueryResult } from 'pg';
import Config from '../Foundation/Config';
import Connection from './Connection';
import { _obj } from 'tiny-supporter';
import { QueryTypes, Sequelize } from 'sequelize';

export default class PostgreSqlConnection extends Connection {
  protected config = Config.getInstance().getConfig('database.connections.postgres');
  protected connection: Sequelize | null = null;

  public getConnection(): Sequelize {
    if (!this.connection) {
      const { driver, host, port, database, username, password } = this.config;
      this.connection = new Sequelize(database, username, password, {
        dialect: driver,
        host,
        port,
      });
    }

    return this.connection;
  }

  public async execute(
    sql: string,
    data: any[] = [],
    callback?: (results: unknown, metadata: unknown) => any,
  ): Promise<unknown[]> {
    const conn = this.getConnection();
    const options = { type: QueryTypes.RAW } as { type: QueryTypes; replacements?: any[] };

    if (data.length) {
      options.replacements = data;
    }

    const [results, metadata] = await conn.query(sql, options);

    return callback ? callback(results, metadata) : [results, metadata];
  }

  /**
   * Insert a new record and get the value of the primary key.
   */
  public async insertGetId(sql: string, data: any[], callback?: (results: unknown, metadata: unknown) => any) {
    const conn = await this.getConnection();

    const [results, metadata] = await conn.query(sql, {
      replacements: data,
      raw: true,
      type: QueryTypes.INSERT,
    });

    return callback ? callback(results, metadata) : [results, metadata];
  }

  public async select(sql: string, data: any[], callback?: (rows: Record<string, unknown>[]) => any) {
    const conn = this.getConnection();
    const options = this.getQueryOption(data);
    options.type = QueryTypes.SELECT;
    options.raw = true;
    const rows = (await conn.query(sql, options)) as Record<string, unknown>[];

    return callback ? callback(rows) : rows;
  }
}
