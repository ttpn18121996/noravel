import { QueryOptions, QueryTypes, Sequelize } from 'sequelize';

export default abstract class Connection {
  abstract getConnection(): Sequelize;
  abstract insertGetId(
    sql: string,
    data: unknown[],
    callback?: (results: unknown, metadata: unknown) => unknown,
  ): unknown;
  abstract execute(sql: string, data: unknown[], callback?: (results: unknown, metadata: unknown) => unknown): unknown;
  abstract select(sql: string, data: unknown[], callback?: (rows: Record<string, unknown>[]) => unknown): unknown;

  public getQueryOption(data: unknown[]) {
    const options = { type: QueryTypes.RAW } as QueryOptions;

    if (data.length) {
      options.replacements = data;
    }

    return options;
  }
}
