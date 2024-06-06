export default abstract class Connection {
  abstract insertGetId(sql: string, data: any[], callback: (err: Error | null, id?: any) => any): unknown;
}
