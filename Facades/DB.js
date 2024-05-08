const Builder = require('../src/Database/Query/Builder');
const ConnectionFactory = require('../src/Database/ConnectionFactory');

const DB = {
  buidler: new Builder(new ConnectionFactory()),
  table: tableName => {
    return DB.buidler.table(tableName);
  },
};

module.exports = DB;
