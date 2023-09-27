const mysql = require('mysql2');

class MySqlConnection {
  constructor() {
    this.config = require('../Foundation/Config')().getConfig('database.connections.mysql');
  }

  getConnection() {
    if (!this.connection) {
      this.connection = mysql.createConnection(this.config);
    }

    return this.connection;
  }
}

module.exports = MySqlConnection;
