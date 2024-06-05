import { _arr, _obj, empty, typeOf } from 'tiny-supporter';
import JoinClause from './JoinClause.js';
import SimplePaginator from '../../Pagination/SimplePaginator.js';
import LengthAwarePaginator from '../../Pagination/LengthAwarePaginator.js';

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
    this.limits = null;
    this.offsets = null;
    this.groups = null;
    this.havings = [];
    this.orders = [];
  }

  connection(connectionName) {
    this.connectionName = connectionName;
    this.connection = this.connectionFactory.getConnection(this.connectionName);

    return this;
  }

  /**
   * Set the name and the alias of the table to query.
   * @param {string} tableName the name of the table to query.
   * @param {string|null} alias the alias of the table.
   * @returns this
   */
  table(tableName, alias = null) {
    const [table, tableAlias] = tableName.split(' as ');

    this.tableAlias = alias ? alias : tableAlias ?? null;
    this.from = table;

    return this;
  }

  /**
   * Set the columns to be selected.
   * @param  {...any} args a list of the column.
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

  /**
   * Add a new select column to the query.
   * @param  {...any} args a list of the additional columns.
   * @returns this
   */
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

  /**
   * Add a join clause to the query.
   * @param {string} table table name to join.
   * @param {string|function} first
   * @param {string} operator
   * @param {string|null} second
   * @param {string} type
   * @returns this
   */
  join(table, first, operator = '=', second = null, type = 'INNER') {
    const joinClause = new JoinClause(new Builder(this.connectionFactory, this.processor), table, type);

    if (typeOf(first) === 'function') {
      first(joinClause);
      this.joins.push(joinClause);

      return this;
    }

    joinClause.on(first, operator, second, 'AND');

    this.joins.push(joinClause);

    return this;
  }

  /**
   * Add a left join to the query.
   * @param {string} table
   * @param {string|function} first
   * @param {string} operator
   * @param {string|null} second
   * @returns this
   */
  leftJoin(table, first, operator = '=', second = null) {
    return this.join(table, first, operator, second, 'LEFT');
  }

  /**
   * Add a right join to the query.
   * @param {string} table
   * @param {string|function} first
   * @param {string} operator
   * @param {string|null} second
   * @returns this
   */
  rightJoin(table, first, operator = '=', second = null) {
    return this.join(table, first, operator, second, 'RIGHT');
  }

  /**
   * Add a basic where clause to the query.
   * @param {string|array|function} column
   * @param {string|null} operator
   * @param {any} value
   * @param {string} boolean
   * @returns this
   */
  where(column, operator = null, value = null, boolean = 'AND') {
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

  /**
   * Add an array of where clauses to the query.
   * @param {array} column
   * @param {string} boolean
   * @param {string} method
   * @returns this
   */
  addArrayOfWheres(column = [], boolean = 'AND', method = 'where') {
    for (let key = 0; key < column.length; key++) {
      const value = column[key];
      value.push(boolean);
      this[method](...value);
    }

    return this;
  }

  /**
   * Prepare the value and operator for a where clause..
   * @param {string} value
   * @param {string} operator
   * @param {boolean} useDefault
   * @returns array
   *
   * @throws RangeError
   */
  prepareValueAndOperator(value, operator, useDefault = false) {
    if (useDefault) {
      return [operator, '='];
    } else if (value === null && _operators.includes(operator) && !['=', '<>', '!='].includes(operator)) {
      throw new RangeError('Operator and value invalid.');
    }

    return [value, operator];
  }

  /**
   * Determine if the given operator is supported.
   * @param {string} operator
   * @returns boolean
   */
  invalidOperator(operator) {
    return !_operators.includes(operator.toLowerCase());
  }

  /**
   * Add an "or where" clause to the query.
   * @param {string|array|function} column
   * @param {string|null} operator
   * @param {any} value
   * @returns this
   */
  orWhere(column, operator = null, value = null) {
    [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);

    return this.where(column, operator, value, 'OR');
  }

  /**
   * Add a "where in" clause to the query.
   * @param {string} column
   * @param {array} list
   * @param {string} boolean
   * @param {boolean} not
   * @returns this
   */
  whereIn(column, list = [], boolean = 'AND', not = 'IN') {
    return this.where(column, not, list, boolean);
  }

  /**
   * Add an "or where in" clause to the query.
   * @param {string} column
   * @param {array} list
   * @returns this
   */
  orWhereIn(column, list = []) {
    return this.whereIn(column, list, 'OR');
  }

  /**
   * Add a "where not in" clause to the query.
   * @param {string} column
   * @param {array} list
   * @param {string} boolean
   * @returns this
   */
  whereNotIn(column, list = [], boolean = 'AND') {
    return this.whereIn(column, list, boolean, 'NOT IN');
  }

  /**
   * Add a "or where not in" clause to the query.
   * @param {string} column
   * @param {array} list
   * @returns this
   */
  orWhereNotIn(column, list = []) {
    return this.whereNotIn(column, list, 'OR');
  }

  /**
   * Add a "where null" clause to the query.
   * @param {string|array} columns
   * @param {string} boolean
   * @param {boolean} not
   * @returns this
   */
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

  /**
   * Add an "or where null" clause to the query.
   * @param {string|array} columns
   * @returns this
   */
  orWhereNull(columns) {
    return this.whereNull(columns, 'OR');
  }

  /**
   * Add a "where not null" clause to the query.
   * @param {string|array} columns
   * @param {string} boolean
   * @returns this
   */
  whereNotNull(columns, boolean = 'AND') {
    return this.whereNull(columns, boolean, true);
  }

  /**
   * Add a where between statement to the query.
   * @param {string} column
   * @param {array} values
   * @param {string} boolean
   * @param {boolean} not
   * @returns this
   */
  whereBetween(column, values = [], boolean = 'AND', not = false) {
    const operator = not ? 'NOT BETWEEN' : 'BETWEEN';

    this.wheres.push([column, operator, values, boolean]);

    return this;
  }

  /**
   * Add an or where between statement to the query.
   * @param {string} column
   * @param {array} values
   * @returns this
   */
  orWhereBetween(column, values = []) {
    return this.whereBetween(column, values, 'OR');
  }

  /**
   * Add an or where between statement to the query.
   * @param {string} column
   * @param {array} values
   * @param {string} boolean
   * @returns this
   */
  whereNotBetween(column, values = [], boolean = 'AND') {
    return this.whereBetween(column, values, boolean, true);
  }

  /**
   * Add an or where not between statement to the query.
   * @param {string} column
   * @param {array} values
   * @returns this
   */
  orWhereNotBetween(column, values = []) {
    return this.whereNotBetween(column, values, 'OR', true);
  }

  /**
   * Add an "or where not null" clause to the query.
   * @param {string|array} columns
   * @returns this
   */
  orWhereNotNull(columns) {
    return this.whereNotNull(columns, 'OR');
  }

  /**
   * Add a "group by" clause to the query.
   * @param  {...any} args
   * @returns this
   */
  groupBy(...args) {
    if (Array.isArray(args[0])) {
      this.groups = args[0];
    } else {
      this.groups = args;
    }

    return this;
  }

  /**
   * Add a "having" clause to the query.
   * @param {string|function} column
   * @param {string|number|null} operator
   * @param {string|number|null} value
   * @param {string} boolean
   * @returns this
   */
  having(column, operator = null, value = null, boolean = 'AND') {
    if (Array.isArray(column)) {
      return this.addArrayOfWheres(column, boolean, 'having');
    }

    this.havings.push([column, operator, value, boolean]);

    return this;
  }

  /**
   * Add an "or having" clause to the query.
   * @param {string|function} column
   * @param {string|number|null} operator
   * @param {string|number|null} value
   * @returns this
   */
  orHaving(column, operator = null, value = null) {
    return this.having(column, operator, value, 'OR');
  }

  /**
   * Add an "order by" clause to the query.
   * @param {string} column
   * @param {string} direction
   * @returns this
   */
  orderBy(column, direction = 'ASC') {
    this.orders.push([column, direction.toUpperCase()]);

    return this;
  }

  /**
   * Add a descending "order by" clause to the query.
   * @param {string} column
   * @returns this
   */
  orderByDesc(column) {
    return this.orderBy(column, 'DESC');
  }

  /**
   * Set the "offset" value of the query.
   * @param {number} offset
   * @returns this
   */
  offset(offset) {
    this.offsets = offset;

    return this;
  }

  /**
   * Set the "limit" value of the query.
   * @param {number} limit
   * @returns this
   */
  limit(limit) {
    this.limits = limit;

    return this;
  }

  /**
   * Set the "limit" and the "offset" value of the query.
   * @param {number} limit
   * @param {number} start
   * @returns this
   */
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

    if (!empty(this.groups)) {
      sql += this.processor.compileGroup(this.groups);
    }

    // Having

    if (!empty(this.orders)) {
      sql += this.processor.compileOrderBy(this.orders);
    }

    sql += this.processor.compileLimit(this.limits, this.offsets);

    return sql;
  }

  /**
   * Insert new records into the database.
   * @param {array|object} data
   * @returns boolean
   */
  async insert(data) {
    if (empty(data)) {
      return true;
    }

    let dataInsert = [];

    if (typeOf(data) === 'object') {
      dataInsert.push(data);
    } else if (typeOf(data) === 'array') {
      dataInsert = dataInsert.concat(data);
    } else {
      return true;
    }

    const sql = this.processor.compileInsert(this.from, dataInsert);
    const bindings = this.processor.getBindings();

    return await this.execute(sql, bindings);
  }

  /**
   * Insert a new record and get the value of the primary key.
   * @param {object} data
   * @returns string|number
   */
  async create(data) {
    if (typeOf(data) !== 'object') {
      return null;
    }

    const sql = this.processor.compileInsert(this.from, [data]);
    const bindings = this.processor.getBindings();
    const _conn = this.connection;

    return await _conn.insertGetId(sql, bindings, (err, id) => id);
  }

  /**
   * Get the SQL representation of the query.
   * @returns string
   */
  toSql() {
    return this.compileSelect();
  }

  /**
   * Get the raw SQL representation of the query with embedded bindings.
   * @returns string
   */
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

  /**
   * Execute the query and get the first result.
   * @param {array|string|null} columns
   * @returns
   */
  async first(columns = null) {
    const result = await this.take(1).get(columns);

    return _arr(result).first();
  }

  /**
   * Execute a query for a single record by ID.
   * @param {number|string} id
   * @param {array|string|null} columns
   * @returns
   */
  async find(id, columns = null) {
    return await this.where('id', id).first(columns);
  }

  /**
   * Execute the query as a "select" statement.
   * @param {array|string|null} columns
   * @returns array
   */
  async get(columns = null) {
    return await this.execute(this.compileSelect(columns), this.getBindings());
  }

  /**
   * Paginate the given query into a simple paginator.
   * @param {number} perPage
   * @param {number} currentPage
   * @param {array} columns
   * @param {string} pageName by default "page"
   * @returns LengthAwarePaginator
   */
  async paginate(perPage, currentPage, columns = ['*'], pageName = 'page') {
    const items = await this.take(perPage, (currentPage - 1) * perPage).get(columns);
    const total = (await this.first(['COUNT(*) as total']))?.total || 0;

    return new LengthAwarePaginator(items, total, perPage, currentPage, { pageName });
  }

  /**
   * Get a paginator only supporting simple next and previous links.
   * @param {number} perPage
   * @param {number} currentPage
   * @param {array} columns
   * @param {string} pageName by default "page"
   * @returns SimplePaginator
   */
  async simplePaginate(perPage, currentPage, columns = ['*'], pageName = 'page') {
    const items = await this.take(perPage, (currentPage - 1) * perPage).get(columns);

    return new SimplePaginator(items, perPage, currentPage, { pageName });
  }

  /**
   * Get the current query value bindings in a flattened array.
   * @returns array
   */
  getBindings() {
    return this.processor.getBindings();
  }

  /**
   * Dump the current SQL and bindings.
   * @returns void
   */
  dd() {
    return {
      sql: this.toSql(),
      bindings: this.getBindings(),
    };
  }

  /**
   * Execute the query manually.
   * @param {string} sql
   * @param {array} data
   * @returns array
   */
  async execute(sql, data = []) {
    return await this.connection.execute(sql, data);
  }
}
