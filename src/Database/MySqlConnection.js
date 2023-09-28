'use strict';

const Connection = require('./Connection');
const mysql = require('mysql2');

class MySqlConnection extends Connection {
  constructor() {
    super();
    this.config = require('../Foundation/Config')().getConfig('database.connections.mysql');
  }

  getConnection() {
    if (!this.connection) {
      const { host, port, user, password, database } = this.config;
      this.connection = mysql.createConnection({ host, port, user, password, database });
    }

    this.checkConnection();

    return this.connection;
  }
}

module.exports = MySqlConnection;
