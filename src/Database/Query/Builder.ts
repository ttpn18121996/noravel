import { _arr } from "tiny-supporter";
import type Connection from "../Connection";
import ConnectionFactory from "../ConnectionFactory";
import type Processor from "./Processors/Processor";

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
  private _connectionFactory: ConnectionFactory;
  private _processor: Processor;
  private _connection: Connection | null;
  private _connectionName: string;
  private _columns: string[] = ['*'];
  private _from: string = '';
  private _tableAlias: string | null = null;
  private _distinct: boolean = false;
  private _wheres = [];
  private _joins = [];
  private _limit: number | null = null;
  private _offset: number | null = null;
  private _groups = null;
  private _havings = [];
  private _orders = [];

  constructor(connectionFactory: ConnectionFactory, processor: Processor) {
    this._connectionFactory = connectionFactory;
    this._processor = processor;
    this._connection = connectionFactory.getConnection();
    this._connectionName = connectionFactory.getConfig('default');
  }

  connection(connectionName: string): this {
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
  table(tableName: string, alias: string | null = null): this {
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
  select(...args: any[]) {
    if (args.length === 1 && Array.isArray(args[0])) {
      this._columns = args[0];
    } else {
      this._columns = args;
    }

    return this;
  }

  /**
   * Add a new select column to the query.
   * @param  {...any} args a list of the additional columns.
   * @returns this
   */
  addSelect(...args: any[]) {
    let addedColumns: any[] = [];
    if (args.length === 1 && Array.isArray(args[0])) {
      addedColumns = addedColumns.concat(args[0]);
    } else {
      addedColumns = [...args];
    }

    this._columns = _arr(this._columns.concat(addedColumns)).unique().get();

    return this;
  }
}
