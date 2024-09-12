import sqlite3, { type Database as IDatabase } from 'sqlite3';
import { QueryTypes, Sequelize } from 'sequelize';
import Config from '../Foundation/Config';
import Connection from './Connection';

export default class SqliteConnection extends Connection {
  protected config = Config.getInstance().getConfig('database.connections.sqlite');
  protected connection: Sequelize | null = null;

  public getConnection(): Sequelize {
    if (!this.connection) {
      const { driver, database } = this.config;
      this.connection = new Sequelize({
        dialect: driver,
        storage: database,
      });
    }

    return this.connection;
  }

  public async execute(
    sql: string,
    data: unknown[] = [],
    callback?: (results: unknown, metadata: unknown) => any,
  ): Promise<unknown[]> {
    const conn = this.getConnection();
    const [results, metadata] = await conn.query(sql, this.getQueryOption(data));

    return callback ? callback(results, metadata) : [results, metadata];
  }

  /**
   * Insert a new record and get the value of the primary key.
   * @param {string} sql
   * @param {array} data
   * @param {function} callback
   * @returns Promise
   */
  async insertGetId(sql: string, data: any[], callback?: (results: unknown, metadata: unknown) => any) {
    const conn = await this.getConnection();

    const [results, metadata] = await conn.query(sql, {
      replacements: data,
      raw: true,
      type: QueryTypes.INSERT,
    });

    return callback ? callback(results, metadata) : [results, metadata];
  }

  toSql() {
    return '';
  }

  public async select(sql: string, data: unknown[] = [], callback?: (rows: Record<string, unknown>[]) => any) {
    const conn = this.getConnection();
    const options = this.getQueryOption(data);
    options.type = QueryTypes.SELECT;
    options.raw = true;
    const rows = (await conn.query(sql, options)) as Record<string, unknown>[];

    return callback ? callback(rows) : rows;
  }
}
