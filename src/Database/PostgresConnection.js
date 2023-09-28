'use strict';

const Connection = require('./Connection');
const { Pool } = require('pg');

class PostgresConnection extends Connection {
  constructor() {
    super();
    this.config = require('../Foundation/Config')().getConfig('database.connections.postgres');
  }

  getConnection() {
    if (!this.connection) {
      const { host, port, user, password, database } = this.config;
      const postgres = new Pool({ host, port, user, password, database });
      this.connection = postgres;
    }

    this.checkConnection();

    return this.connection;
  }
}

module.exports = PostgresConnection;
