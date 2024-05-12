import Builder from './Query/Builder.js';
import ConnectionFactory from './ConnectionFactory.js';
import Container from '../Foundation/Container.js';
import MySqlProcessor from './Query/Processors/MySqlProcessor.js';
import PostgreSqlProcessor from './Query/Processors/PostgreSqlProcessor.js';
import SqliteProcessor from './Query/Processors/SqliteProcessor.js';

const DB = (() => {
  let config;

  function getProcessor(name = null) {
    if (!name) {
      name = Container.getInstance().getConfig('database.default');
    }

    config = Container.getInstance().getConfig('database.connections.' + name);

    switch (config.driver) {
      case 'mysql':
      case 'mariadb':
        return new MySqlProcessor();
      case 'pgsql':
        return new PostgreSqlProcessor();
      case 'sqlite':
        return new SqliteProcessor();
      default:
        return null;
    }
  }

  function builder() {
    return new Builder(new ConnectionFactory(), getProcessor());
  }

  return {
    builder,
    table: (tableName, alias = null) => {
      return builder().table(tableName, alias);
    },
    getProcessor,
  }
})();

export default DB;
