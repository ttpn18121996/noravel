import { _arr, empty, typeOf } from 'tiny-supporter';
import type Connection from '../Connection';
import ConnectionFactory from '../ConnectionFactory';
import type Processor from './Processors/Processor';
import { IJoinClause, OrderByType } from '../../Contracts/Database/Builder';
import JoinClause from './JoinClause';

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
  public _connectionFactory: ConnectionFactory;
  public _processor: Processor;
  public _connection: Connection | null;
  public _connectionName: string;
  public _columns: string[] = ['*'];
  public _from: string = '';
  public _tableAlias: string | null = null;
  public _distinct: boolean = false;
  public _wheres: any[] = [];
  public _joins: IJoinClause[] = [];
  public _limit: number | null = null;
  public _offset: number | null = null;
  public _groups: string[] = [];
  public _havings: any[] = [];
  public _orders: OrderByType = [];

  public constructor(connectionFactory: ConnectionFactory, processor: Processor) {
    this._connectionFactory = connectionFactory;
    this._processor = processor;
    this._connection = connectionFactory.getConnection();
    this._connectionName = connectionFactory.getConfig('default');
  }

  public connection(connectionName: string): this {
    this._connectionName = connectionName;
    this._connection = this._connectionFactory.getConnection(this._connectionName);

    return this;
  }

  /**
   * Set the name and the alias of the table to query.
   * @param {string} tableName the name of the table to query.
   * @param {string|null} alias the alias of the table.
   * @returns this
   */
  public table(tableName: string, alias: string | null = null): this {
    const [table, tableAlias] = tableName.split(' as ');

    this._tableAlias = alias ? alias : tableAlias ?? null;
    this._from = table;

    return this;
  }

  /**
   * Set the columns to be selected.
   * @param  {...any} args a list of the column.
   * @returns this
   */
  public select(...args: any[]): this {
    if (args.length === 1 && Array.isArray(args[0])) {
      this._columns = args[0];
    } else {
      this._columns = args;
    }

    return this;
  }

  /**
   * Add a new select column to the query.
   */
  public addSelect(...args: any[]): this {
    let addedColumns: any[] = [];
    if (args.length === 1 && Array.isArray(args[0])) {
      addedColumns = addedColumns.concat(args[0]);
    } else {
      addedColumns = [...args];
    }

    this._columns = _arr(this._columns.concat(addedColumns)).unique().get();

    return this;
  }

  /**
   * Add a join clause to the query.
   */
  public join(
    table: string,
    first: (join: IJoinClause) => void | string,
    operator: string = '=',
    second: string | null = null,
    type: string = 'INNER',
  ): this {
    const joinClause = new JoinClause(new Builder(this._connectionFactory, this._processor), table, type);

    if (typeOf(first) === 'function') {
      (first as (join: IJoinClause) => void)(joinClause);
      this._joins.push(joinClause);

      return this;
    }

    joinClause.on(`${first}`, operator, `${second}`, 'AND');

    this._joins.push(joinClause);

    return this;
  }

  /**
   * Add a left join to the query.
   */
  public leftJoin(
    table: string,
    first: (join: IJoinClause) => void | string,
    operator: string = '=',
    second: string | null = null,
  ): this {
    return this.join(table, first, operator, second, 'LEFT');
  }

  /**
   * Add a right join to the query.
   */
  public rightJoin(
    table: string,
    first: (join: IJoinClause) => void | string,
    operator: string = '=',
    second: string | null = null,
  ): this {
    return this.join(table, first, operator, second, 'RIGHT');
  }

  /**
   * Add a basic where clause to the query.
   */
  public where(column: any, operator: string | null = null, value: any = null, boolean: string = 'AND'): this {
    if (Array.isArray(column)) {
      return this.addArrayOfWheres(column, boolean);
    }

    if (typeOf(column) === 'function') {
      const builder = (column as (query: Builder) => Builder)(new Builder(this._connectionFactory, this._processor));
      this._wheres.push(builder._wheres);

      return this;
    }

    [value, operator] = this.prepareValueAndOperator(value, operator ?? '=', arguments.length === 2);

    if (value === null) {
      return this.whereNull(column, boolean);
    }

    if (this.invalidOperator(operator)) {
      operator = '=';
    }

    this._wheres.push([column, operator, value, boolean]);

    return this;
  }

  /**
   * Add an array of where clauses to the query.
   */
  protected addArrayOfWheres(
    column: string[][] = [],
    boolean: string = 'AND',
    method: 'where' | 'having' = 'where',
  ): this {
    for (let key = 0; key < column.length; key++) {
      const value = column[key];
      value.push(boolean);
      // @ts-ignore
      this[method](...value);
    }

    return this;
  }

  /**
   * Prepare the value and operator for a where clause.
   *
   * @throws RangeError
   */
  protected prepareValueAndOperator(value: string, operator: string, useDefault: boolean = false): string[] {
    if (useDefault) {
      return [operator, '='];
    } else if (value === null && _operators.includes(operator) && !['=', '<>', '!='].includes(operator)) {
      throw new RangeError('Operator and value invalid.');
    }

    return [value, operator];
  }

  /**
   * Determine if the given operator is supported.
   */
  protected invalidOperator(operator: string): boolean {
    return !_operators.includes(operator.toLowerCase());
  }

  /**
   * Add an "or where" clause to the query.
   */
  public orWhere(column: any, operator: string | null = null, value: any = null): this {
    [value, operator] = this.prepareValueAndOperator(value, operator ?? '=', arguments.length === 2);

    return this.where(column, operator, value, 'OR');
  }

  /**
   * Add a "where in" clause to the query.
   */
  public whereIn(column: any, list: number[] | string[] = [], boolean: string = 'AND', not: string = 'IN'): this {
    return this.where(column, not, list, boolean);
  }

  /**
   * Add an "or where in" clause to the query.
   */
  public orWhereIn(column: any, list: number[] | string[] = []): this {
    return this.whereIn(column, list, 'OR');
  }

  /**
   * Add a "where not in" clause to the query.
   */
  public whereNotIn(column: any, list: number[] | string[] = [], boolean: string = 'AND'): this {
    return this.whereIn(column, list, boolean, 'NOT IN');
  }

  /**
   * Add a "or where not in" clause to the query.
   */
  public orWhereNotIn(column: any, list: number[] | string[] = []): this {
    return this.whereNotIn(column, list, 'OR');
  }

  /**
   * Add a "where null" clause to the query.
   */
  public whereNull(columns: string | string[], boolean: string = 'AND', not: boolean = false): this {
    const operator = not ? 'NOT NULL' : 'NULL';

    if (!Array.isArray(columns)) {
      columns = [columns];
    }

    for (const column of columns) {
      this._wheres.push([column, `IS ${operator}`, null, boolean]);
    }

    return this;
  }

  /**
   * Add an "or where null" clause to the query.
   */
  public orWhereNull(columns: string | string[]): this {
    return this.whereNull(columns, 'OR');
  }

  /**
   * Add a "where not null" clause to the query.
   */
  public whereNotNull(columns: string | string[], boolean: string = 'AND'): this {
    return this.whereNull(columns, boolean, true);
  }

  /**
   * Add a where between statement to the query.
   */
  public whereBetween(
    column: string,
    values: number[] | string[] = [],
    boolean: string = 'AND',
    not: boolean = false,
  ): this {
    const operator = not ? 'NOT BETWEEN' : 'BETWEEN';

    this._wheres.push([column, operator, values, boolean]);

    return this;
  }

  /**
   * Add an or where between statement to the query.
   */
  public orWhereBetween(column: string, values: number[] | string[] = []): this {
    return this.whereBetween(column, values, 'OR');
  }

  /**
   * Add an or where between statement to the query.
   */
  public whereNotBetween(column: string, values: number[] | string[] = [], boolean: string = 'AND'): this {
    return this.whereBetween(column, values, boolean, true);
  }

  /**
   * Add an or where not between statement to the query.
   */
  public orWhereNotBetween(column: string, values: number[] | string[] = []): this {
    return this.whereNotBetween(column, values, 'OR');
  }

  /**
   * Add an "or where not null" clause to the query.
   */
  public orWhereNotNull(columns: string | string[]): this {
    return this.whereNotNull(columns, 'OR');
  }

  /**
   * Add a "group by" clause to the query.
   */
  public groupBy(...args: any[]): this {
    if (Array.isArray(args[0])) {
      this._groups = args[0];
    } else {
      this._groups = args;
    }

    return this;
  }

  /**
   * Add a "having" clause to the query.
   */
  public having(
    column: any,
    operator: string | number | null = null,
    value: any = null,
    boolean: string = 'AND',
  ): this {
    if (Array.isArray(column)) {
      return this.addArrayOfWheres(column, boolean, 'having');
    }

    if (typeOf(column) === 'function') {
      const builder = (column as (query: Builder) => Builder)(new Builder(this._connectionFactory, this._processor));
      this._wheres.push(builder._wheres);

      return this;
    }

    [value, operator] = this.prepareValueAndOperator(value, (operator as string) ?? '=', arguments.length === 2);

    if (this.invalidOperator(operator)) {
      operator = '=';
    }

    this._havings.push([column, operator, value, boolean]);

    return this;
  }

  /**
   * Add an "or having" clause to the query.
   */
  public orHaving(column: any, operator: string | number | null = null, value: any = null): this {
    return this.having(column, operator, value, 'OR');
  }

  /**
   * Add an "order by" clause to the query.
   */
  public orderBy(column: string, direction: string = 'ASC'): this {
    this._orders.push([column, direction.toUpperCase()]);

    return this;
  }

  /**
   * Add a descending "order by" clause to the query.
   */
  public orderByDesc(column: string): this {
    return this.orderBy(column, 'DESC');
  }

  /**
   * Set the "offset" value of the query.
   */
  public offset(offset: number): this {
    this._offset = offset;

    return this;
  }

  /**
   * Set the "limit" value of the query.
   */
  public limit(limit: number): this {
    this._limit = limit;

    return this;
  }

  /**
   * Set the "limit" and the "offset" value of the query.
   */
  public take(limit: number, start: number = 0): this {
    return this.limit(limit).offset(start);
  }

  public compileSelect(columns?: string[]): string | null {
    if (columns && columns.length) {
      this._columns = columns;
    }

    if (this._from === null || this._from === undefined) {
      return null;
    }

    let sql = this._distinct ? 'SELECT distinct ' : 'SELECT ';
    sql += `${this._columns.join(', ')} FROM ${this._from}${this._tableAlias ? ' as ' + this._tableAlias : ''}`;

    if (!empty(this._joins)) {
      sql += this._processor.compileJoin(this._joins);
    }

    if (!empty(this._wheres)) {
      sql += this._processor.compileWhere(this._wheres);
    }

    if (!empty(this._groups)) {
      sql += this._processor.compileGroup(this._groups);
    }

    // Having

    if (!empty(this._orders)) {
      sql += this._processor.compileOrderBy(this._orders);
    }

    sql += this._processor.compileLimit(this._limit, this._offset);

    return sql;
  }

  /**
   * Insert a new record and get the value of the primary key.
   */
  public async create(data: { [key: string]: any }) {
    if (typeOf(data) !== 'object') {
      return null;
    }

    const sql = this._processor.compileInsert(this._from, [data]);
    const bindings = this._processor.getBindings();
    const _conn = this._connection;

    if (!_conn) {
      throw new Error('Connect to database failed');
    }

    return await _conn.insertGetId(sql, bindings, (err: Error | null, id: any) => id);
  }
}
