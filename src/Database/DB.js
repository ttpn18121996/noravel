import Builder from './Query/Builder.js';
import ConnectionFactory from './ConnectionFactory.js';

const DB = {
  buidler: () => new Builder(new ConnectionFactory()),
  table: tableName => {
    return DB.buidler().table(tableName);
  },
};

export default DB;
