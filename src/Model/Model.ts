import { _obj } from '@noravel/supporter';
import { DB } from '../Database';
import Builder from '../Database/Query/Builder';
import Config from '../Foundation/Config';

export default class Model {
  protected table: string = '';
  protected primaryKey: string = 'id';
  protected attributes: Record<string, unknown> = {};
  protected fillable: string[] = [];
  protected hidden: string[] = [];
  protected connection: string;

  constructor(attributes: Record<string, unknown> = {}) {
    this.setAttributes(attributes);
    this.connection = Config.getInstance().getConfig('database.default');
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

  public newQuery(): Builder {
    return DB.table(this.getTable()).connection(this.connection).setModel(this);
  }

  public static query(): Builder {
    return new this().newQuery();
  }

  public jsonSerialize(): Object {
    return _obj.except(this.attributes, this.hidden);
  }

  public toJson(): string {
    return JSON.stringify(this.jsonSerialize());
  }

  public clone(): this {
    return new (this.constructor as new () => this)();
  }
}
