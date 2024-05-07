class Builder {
  constructor(ConnectionFactory) {
    this.connectionFactory = ConnectionFactory;
    this.connection = ConnectionFactory.getConnection();
    this.from = '';
  }

  connection(connectionName) {
    this.connection = ConnectionFactory.getConnection(connectionName);

    return this;
  }

  table(tableName) {
    this.from = tableName;

    return this;
  }

  executeRaw(sql, callback) {
    return this.connection.execute(sql, callback);
  }
}

module.exports = Builder;
