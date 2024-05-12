import { _arr, empty, typeOf } from 'tiny-supporter';
import JoinClause from './JoinClause.js';

const _operators = [
  '=',
  '<',
  '>',
  '<=',
  '>=',
  '<>',
  '!=',
  '<=>',
  'like',
  'like binary',
  'not like',
  'ilike',
  '&',
  '|',
  '^',
  '<<',
  '>>',
  'rlike',
  'not rlike',
  'regexp',
  'not regexp',
  '~',
  '~*',
  '!~',
  '!~*',
  'similar to',
  'not similar to',
  'not ilike',
  '~~*',
  '!~~*',
  'in',
  'not in',
];

export default class Builder {
  constructor(connectionFactory, processor) {
    this.connectionFactory = connectionFactory;
    this.processor = processor;
    this.connection = connectionFactory.getConnection();
    this.connectionName = connectionFactory.getConfig('default');
    this.columns = ['*'];
    this.from = '';
    this.tableAlias = null;
    this.distinct = false;
    this.wheres = [];
    this.joins = [];
    this.limit = null;
    this.offset = null;
    this.groups = null;
    this.havings = [];
  }

  connection(connectionName) {
    this.connectionName = connectionName;
    this.connection = this.connectionFactory.getConnection(this.connectionName);

    return this;
  }

  table(tableName, alias = null) {
    const [table, tableAlias] = tableName.split(' as ');

    this.tableAlias = alias ? alias : tableAlias ?? null;
    this.from = table;

    return this;
  }

  /**
   * Set columns for query.
   * @param  {...any} args a list of the column
   * @returns this
   */
  select(...args) {
    if (args.length === 1 && Array.isArray(args[0])) {
      this.columns = args[0];
    } else {
      this.columns = args;
    }

    return this;
  }

  addSelect(...args) {
    let addedColumns = [];
    if (args.length === 1 && Array.isArray(args[0])) {
      addedColumns = addedColumns.concat(args[0]);
    } else {
      addedColumns = [...args];
    }

    this.columns = _arr(this.columns.concat(addedColumns)).unique().get();

    return this;
  }

  join(table, first, operator = '=', second = null, type = 'INNER') {
    const joinClause = new JoinClause(new Builder(this.connectionFactory, this.processor), table, type);

    if (typeOf(first) === 'function') {
      first(joinClause);
      this.joins.push(joinClause);

      return this;
    }

    this.joins.push(joinClause.on(first, operator, second, 'AND'));

    return this;
  }

  leftJoin(table, first, operator = '=', second = null) {
    return this.join(table, first, operator, second, 'LEFT');
  }
  
  rightJoin(table, first, operator = '=', second = null) {
    return this.join(table, first, operator, second, 'RIGHT');
  }

  where(column, operator, value = null, boolean = 'AND') {
    if (Array.isArray(column)) {
      return this.addArrayOfWheres(column, boolean);
    }

    if (typeOf(column) === 'function') {
      const builder = column(new Builder(this.connectionFactory, this.processor));
      this.wheres.push(builder.wheres);

      return this;
    }

    [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);

    if (value === null) {
      return this.whereNull(column, boolean);
    }

    if (this.invalidOperator(operator)) {
      operator = '=';
    }

    this.wheres.push([column, operator, value, boolean]);

    return this;
  }

  addArrayOfWheres(column = [], boolean = 'AND', method = 'where') {
    for (let key = 0; key < column.length; key++) {
      const value = column[key];
      value.push(boolean);
      this[method](...value);
    }

    return this;
  }

  prepareValueAndOperator(value, operator, useDefault = false) {
    if (useDefault) {
      return [operator, '='];
    } else if (value === null && _operators.includes(operator) && !['=', '<>', '!='].includes(operator)) {
      throw new Error('Operator and value invalid.');
    }

    return [value, operator];
  }

  invalidOperator(operator) {
    return !_operators.includes(operator.toLowerCase());
  }

  orWhere(column, operator, value = null) {
    [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);

    return this.where(column, operator, value, 'OR');
  }

  whereIn(column, list = [], boolean = 'AND', not = 'IN') {
    return this.where(column, not, list, boolean);
  }

  whereNotIn(column, list = [], boolean = 'AND') {
    return this.whereIn(column, list, boolean, 'NOT IN');
  }

  orWhereIn(column, list = []) {
    return this.whereIn(column, list, 'OR');
  }

  orWhereNotIn(column, list = []) {
    return this.whereNotIn(column, list, 'OR');
  }

  whereNull(columns, boolean = 'AND', not = false) {
    const operator = not ? 'NOT NULL' : 'NULL';

    if (!Array.isArray(columns)) {
      columns = [columns];
    }

    for (const column of columns) {
      this.wheres.push([column, `IS ${operator}`, null, boolean]);
    }

    return this;
  }

  whereNotNull(columns, boolean = 'AND') {
    return this.whereNull(columns, boolean, true);
  }

  orWhereNull(columns) {
    return this.whereNull(columns, 'OR');
  }

  orWhereNotNull(columns) {
    return this.whereNotNull(columns, 'OR');
  }

  groupBy(...args) {
    if (Array.isArray(args[0])) {
      this.groups = args[0];
    } else {
      this.groups = args;
    }

    return this;
  }

  having(column, operator, value, boolean = 'AND') {
    if (Array.isArray(column)) {
      return this.addArrayOfWheres(column, boolean, 'having');
    }

    this.havings.push([column, operator, value, boolean]);

    return this;
  }

  orHaving(column, operator, value) {
    return this.having(column, operator, value, 'OR');
  }

  limit(limit) {
    this.limit = limit;

    return this;
  }

  offset(offset) {
    this.offset = offset;

    return this;
  }

  take(limit, start = 0) {
    return this.limit(limit).offset(start);
  }

  compileSelect(columns) {
    if (!empty(columns)) {
      this.columns = columns;
    }

    if (this.from === null || this.from === undefined) {
      return null;
    }

    let sql = this.distinct ? 'SELECT distinct ' : 'SELECT ';
    sql += `${this.columns.join(', ')} FROM ${this.from}${this.tableAlias ? ' as ' + this.tableAlias : ''}`;

    if (!empty(this.joins)) {
      sql += this.processor.compileJoin(this.joins);
    }

    if (!empty(this.wheres)) {
      sql += this.processor.compileWhere(this.wheres);
    }

    sql += this.processor.compileLimit(this.limit, this.offset);

    return sql;
  }

  async get(columns = null) {
    return await this.execute(this.compileSelect(columns), this.getBindings());
  }

  toSql() {
    return this.compileSelect();
  }

  getBindings() {
    return this.processor.getBindings();
  }

  toRawSql() {
    let sql = this.toSql();
    const bindings = [...this.getBindings()];

    do {
      const temp = bindings.shift();
      if (temp === null || temp === undefined) {
        sql = sql.replace(/ \!= \?/, ' IS NOT NULL').replace(/ = \?/, ' IS NULL');
      } else if (typeOf(temp) === 'number') {
        sql = sql.replace(/\?/, temp);
      } else {
        sql = sql.replace(/\?/, `'${temp}'`);
      }
    } while (bindings.length);

    return sql;
  }

  dd() {
    return {
      sql: this.toSql(),
      bindings: this.getBindings(),
    };
  }

  async execute(sql, data = []) {
    return await this.connection.execute(sql, data);
  }
}
