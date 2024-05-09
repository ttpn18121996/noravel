import Builder from '../src/Database/Query/Builder.js';
import ConnectionFactory from '../src/Database/ConnectionFactory.js';

const DB = {
  buidler: new Builder(new ConnectionFactory()),
  table: tableName => {
    return DB.buidler.table(tableName);
  },
};

export default DB;
