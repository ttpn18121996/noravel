import Processor from './Processor';

export default class PostgreSqlProcessor extends Processor {
  public compileLimit(limit?: number | null, offset?: number | null): string {
    let sql = '';

    if (limit !== null && limit !== undefined) {
      sql += ` LIMIT ${limit}`;
    }

    if (offset !== null && offset !== undefined) {
      sql += ` OFFSET ${offset}`;
    }

    return sql;
  }
}
