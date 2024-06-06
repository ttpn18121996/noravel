import { _arr, typeOf } from 'tiny-supporter';
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
  public _havings = [];
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
   * @param {string|array|function} column
   * @param {string|null} operator
   * @param {any} value
   * @param {string} boolean
   * @returns this
   */
  public where(
    column: (query: Builder) => Builder | string | string[][],
    operator: string | null = null,
    value: any = null,
    boolean: string = 'AND',
  ): this {
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
  public orWhere(
    column: (query: Builder) => Builder | string | string[][],
    operator: string | null = null,
    value: any = null,
  ): this {
    [value, operator] = this.prepareValueAndOperator(value, operator ?? '=', arguments.length === 2);

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
  public whereIn(
    column: (query: Builder) => Builder | string | string[][],
    list: number[] | string[] = [],
    boolean = 'AND',
    not = 'IN',
  ) {
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
}
