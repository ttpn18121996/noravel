import Config from '../Foundation/Config';
import ConnectionFactory from './ConnectionFactory';
import Builder from './Query/Builder';
import MySqlProcessor from './Query/Processors/MySqlProcessor';
import PostgreSqlProcessor from './Query/Processors/PostgreSqlProcessor';
import SqliteProcessor from './Query/Processors/SqliteProcessor';

class DB {
  private static _config: any;

  public static getProcessor(name?: string) {
    if (!name) {
      name = Config.getInstance().getConfig('database.default');
    }

    DB._config = Config.getInstance().getConfig('database.connections.' + name);

    switch (DB._config.driver) {
      case 'mysql':
      case 'mariadb':
        return new MySqlProcessor();
      case 'pgsql':
      case 'postgre':
        return new PostgreSqlProcessor();
      case 'sqlite':
        return new SqliteProcessor();
      default:
        return null;
    }
  }

  public static builder(): Builder {
    const processor = DB.getProcessor();

    if (!processor) {
      throw new Error('Can not get the processor');
    }

    return new Builder(new ConnectionFactory(), processor);
  }

  public static table(tableName: string, alias?: string) {
    return DB.builder().table(tableName, alias);
  }
}

export default DB;
