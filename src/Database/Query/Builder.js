const _operators = [
  '=', '<', '>', '<=', '>=', '<>', '!=', '<=>',
  'like', 'like binary', 'not like', 'ilike',
  '&', '|', '^', '<<', '>>',
  'rlike', 'not rlike', 'regexp', 'not regexp',
  '~', '~*', '!~', '!~*', 'similar to',
  'not similar to', 'not ilike', '~~*', '!~~*',
  'in', 'not in'
];

export default class Builder {
  constructor(ConnectionFactory) {
    this.connectionFactory = ConnectionFactory;
    this.connection = ConnectionFactory.getConnection();
    this.connectionName = ConnectionFactory.getConfig('default');
    this.columns = ['*'];
    this.from = '';
    this.join = [];
    this.wheres = [];
  }

  connection(connectionName) {
    this.connectionName = connectionName;
    this.connection = ConnectionFactory.getConnection(this.connectionName);

    return this;
  }

  table(tableName) {
    this.from = tableName;

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
      this.columns = args[0];
    }

    return this;
  }

  addSelect(...args) {
    //
  }

  async execute(sql, data = []) {
    return await this.connection.execute(sql, data);
  }
}
