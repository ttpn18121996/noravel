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

    return new Proxy(this, {
      get(target, prop, receiver) {
        const value = target[prop as keyof Model];

        if (value instanceof Function) {
          const _this = this;

          return function (...args: any[]) {
            return (value as Function).apply(_this === receiver ? target : _this, args);
          };
        }

        if (value === undefined) {
          return function (...args: any[]) {
            const builder = DB.builder().setModel(target);

            return (builder?.[prop as keyof Builder] as Function)?.apply(builder, args);
          };
        }

        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }

        return target.getAttribute(prop as string);
      },
      set(target, prop, value, receiver) {
        if (prop in target) {
          Reflect.set(target, prop, value, receiver);

          return true;
        }

        target.setAttributes({ [prop as string]: value });

        return true;
      },
    });
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

  public getAttribute(key: string, defaultValue?: any) {
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
