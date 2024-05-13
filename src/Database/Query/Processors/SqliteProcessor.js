import Processor from './Processor.js';

export default class SqliteProcessor extends Processor {
  compileLimit(limit, offset) {
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
