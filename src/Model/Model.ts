import { _obj } from "tiny-supporter";
import { DB } from "../Database";
import Builder from "../Database/Query/Builder";

export default class Model {
  protected table: string = '';
  protected primaryKey: string = 'id';
  protected attributes: Record<string, unknown> = {};
  protected fillable: string[] = [];
  protected hidden: string[] = [];

  constructor(
    attributes: Record<string, unknown> = {}
  ) {
    this.attributes = { ...this.attributes, ...attributes };
  }

  public fill(attributes: Record<string, unknown>) {
    const _attr = _obj.only(attributes, this.fillable);
    this.attributes = { ...this.attributes, ..._attr };

    return this;
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

  public query(connection?: string): Builder {
    const builder = DB.table(this.getTable()).setModel(this.getClass());

    if (connection) {
      return builder.connection(connection);
    }

    return builder;
  }

  public getClass(): string {
    return this.constructor.name;
  }

  public jsonSerialize(): Object {
    return _obj.except(this.attributes, this.hidden);
  }

  public toJson(): string {
    return JSON.stringify(this.jsonSerialize());
  }
}
