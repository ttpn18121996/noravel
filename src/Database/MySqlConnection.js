'use strict';

const Connection = require('./Connection');
const Container = require('../Foundation/Container');
const mysql = require('mysql2');

class MySqlConnection extends Connection {
  constructor() {
    super();
    this.config = Container.getConfig('database.connections.mysql');
  }

  getConnection() {
    if (!this.connection) {
      const { host, port, username, password, database } = this.config;
      this.connection = mysql.createConnection({ host, port, user: username, password, database });
    }

    this.checkConnection();

    return this.connection;
  }
}

module.exports = MySqlConnection;
