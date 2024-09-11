import { Sequelize } from 'sequelize';

export default abstract class Connection {
  abstract getConnection(): Sequelize;
  abstract insertGetId(sql: string, data: any[], callback?: (results: unknown, metadata: unknown) => any): unknown;
  abstract execute(sql: string, data: any[], callback?: (results: unknown, metadata: unknown) => any): unknown;
  abstract select(sql: string, data: any[], callback?: (rows: Record<string, unknown>[]) => any): unknown;
}
