import Processor from './Processor.js';

export default class SqliteProcessor extends Processor {
  compileLimit(limit = null, offset = null) {
    let result = '';

    if (limit !== null) {
      result += ` LIMIT ${limit}`;
    }

    if (offset !== null) {
      result += ` OFFSET ${offset}`;
    }

    return result;
  }
}
