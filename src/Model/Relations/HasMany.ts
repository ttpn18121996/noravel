import Builder from '../../Database/Query/Builder';
import Model from '../Model';
import Relation from './Relation';

export default class HasMany<T extends Model, TChild extends Model> extends Relation<TChild> {
  protected data: TChild[] = [];
  protected _parent: T;

  public constructor(
    query: Builder,
    parent: T,
    protected foreignKey: string,
    protected localKey?: string,
  ) {
    super(query);
    this._parent = parent;
    this.localKey = localKey ?? parent.getKeyName();
    this._query = query.where(foreignKey, parent.getAttribute(this.localKey));
  }

  public async get(): Promise<TChild[]> {
    if (!this._model || !this._parent) {
      return [];
    }

    this.data = await this._query.get() as TChild[];

    return this.data;
  }
}
