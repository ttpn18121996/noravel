import { _obj, _str } from '@noravel/supporter';
import { DB } from '../Database';
import Builder from '../Database/Query/Builder';
import Config from '../Foundation/Config';
import HasMany from './Relations/HasMany';
import Relation from './Relations/Relation';
import BelongsTo from './Relations/BelongsTo';

type TimestampColumns = {
  createdAt: string;
  updatedAt: string;
};

export default class Model {
  protected _table: string = '';
  protected _primaryKey: string = 'id';
  protected _incrementing = true;
  protected _attributes: Record<string, unknown> = {};
  protected _fillable: string[] = [];
  protected _hidden: string[] = [];
  protected _connection: string;
  protected _timestampColumns: TimestampColumns = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  };
  public timestamps: boolean = true;
  protected _relations: unknown[] = [];

  public constructor(attributes: Record<string, unknown> = {}) {
    this.setAttributes(attributes);
    this._connection = Config.getInstance().getConfig('database.default');

    return new Proxy(this, {
      get(target, prop, receiver) {
        const value = target[prop as keyof Model];

        if (value instanceof Function) {
          return function (...args: any[]) {
            return (value as Function).apply(target, args);
          };
        }

        if (value === undefined) {
          const builder = DB.builder().setModel(target);

          if (builder?.[prop as keyof Builder] as Function) {
            return function (...args: any[]) {
              return (builder?.[prop as keyof Builder] as Function).apply(builder, args);
            };
          }
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
    const _attr = _obj.only(attributes, this._fillable) as Record<string, unknown>;

    return this.setAttributes(_attr);
  }

  public newUniqueId(): string | number {
    return _str().random().toString();
  }

  public async save(): Promise<unknown> {
    if (this.timestamps) {
      this.setTimestampValue();
    }

    if (this.getPrimaryKey()) {
      await this.newQuery().update(_obj.except(this._attributes, [this.getKeyName()]));
    } else {
      const id = await this.newQuery().create(this._attributes);
      this.setAttribute(this.getKeyName(), id);
    }

    return this;
  }

  public setTimestampValue(): void {
    const now = new Date();

    if (!this.getAttribute(this._timestampColumns.createdAt)) {
      this.setAttribute(this._timestampColumns.createdAt, now);
    }

    if (!this.getAttribute(this._timestampColumns.updatedAt)) {
      this.setAttribute(this._timestampColumns.updatedAt, now);
    }
  }

  public getTable(): string {
    return this._table;
  }

  public getKeyName(): string {
    return this._primaryKey;
  }

  public getPrimaryKey(): any {
    return this.getAttribute(this.getKeyName());
  }

  public getAttribute(key: string, defaultValue?: any): any {
    return _obj.get(this._attributes, key, defaultValue);
  }

  public setAttributes(attributes: Record<string, unknown> = {}): this {
    this._attributes = { ...this._attributes, ...attributes };

    return this;
  }

  public setAttribute(key: string, value: any): this {
    return this.setAttributes({ [key]: value });
  }

  public setConnection(connectionName: string): this {
    this._connection = connectionName;

    return this;
  }

  public getConnection(): string {
    return this._connection;
  }

  public jsonSerialize(): Object {
    return _obj.except(this._attributes, this._hidden);
  }

  public toJson(): string {
    return JSON.stringify(this.jsonSerialize());
  }

  protected newRelatedInstance<T extends Model>(relatedClass: new () => T) {
    const instance = new relatedClass();

    if (!instance.getConnection()) {
      instance.setConnection(this.getConnection());
    }

    return instance;
  }

  public belongsTo<T extends Model>(related: new () => T, foreignKey: string, ownerKey: string = 'id'): BelongsTo<this, T> {
    const instance = this.newRelatedInstance(related);
    const belongsTo = new BelongsTo<this, T>(this.newQuery(), this, foreignKey, ownerKey);
    belongsTo.setModel(instance);

    this._relations.push(belongsTo);

    return belongsTo;
  }

  public hasMany<T extends Model>(related: new () => T, foreignKey: string, localKey: string = 'id'): HasMany<this, T> {
    const instance = this.newRelatedInstance(related);
    const hasMany = new HasMany<this, T>(this.newQuery(), this, foreignKey, localKey);
    hasMany.setModel(instance);

    this._relations.push(hasMany);

    return hasMany;
  }

  public replicate<T extends typeof Model>(): InstanceType<T> {
    return this.newModel(this._attributes) as InstanceType<T>;
  }

  public newModel<T extends typeof Model>(attributes: Record<string, unknown> = {}): InstanceType<T> {
    const NewClass = this.constructor as { new (attributes: Record<string, unknown>): T };

    return new NewClass(attributes) as InstanceType<T>;
  }

  public newQuery(): Builder {
    return DB.builder().setModel(this);
  }

  public static query(): Builder {
    return new this().newQuery();
  }
}
