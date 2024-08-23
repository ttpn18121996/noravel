import { _obj } from 'tiny-supporter';
import { DB } from '../Database';
import Builder from '../Database/Query/Builder';

export default class Model {
  protected table: string = '';
  protected primaryKey: string = 'id';
  protected attributes: Record<string, unknown> = {};
  protected fillable: string[] = [];
  protected hidden: string[] = [];

  constructor(attributes: Record<string, unknown> = {}) {
    this.setAttributes(attributes);
  }

  public fill(attributes: Record<string, unknown>) {
    const _attr = _obj.only(attributes, this.fillable) as Record<string, unknown>;

    return this.setAttributes(_attr);
  }

  public getTable(): string {
    return this.table;
  }

  public getKeyName(): string {
    return this.primaryKey;
  }

  public getPrimaryKey(): any {
    return this.attributes?.[this.getKeyName()];
  }

  public getAttribute(key: string, defaultValue: any) {
    return _obj.get(this.attributes, key, defaultValue);
  }

  public setAttributes(attributes: Record<string, unknown> = {}): this {
    this.attributes = { ...this.attributes, ...attributes };

    return this;
  }

  public query(connection?: string): Builder {
    const builder = DB.table(this.getTable()).setModel(this.getClass());

    if (connection) {
      return builder.connection(connection);
    }

    return builder;
  }

  public getClass(): this {
    return this;
  }

  public jsonSerialize(): Object {
    return _obj.except(this.attributes, this.hidden);
  }

  public toJson(): string {
    return JSON.stringify(this.jsonSerialize());
  }
}
