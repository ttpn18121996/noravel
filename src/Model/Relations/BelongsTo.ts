import Builder from '../../Database/Query/Builder';
import Model from '../Model';
import Relation from './Relation';

export default class BelongsTo<T extends Model, TParent extends Model> extends Relation<TParent> {
  protected data?: TParent;
  protected _child: T;

  public constructor(
    query: Builder,
    child: T,
    protected foreignKey: string,
    protected ownerKey: string,
  ) {
    super(query);
    this._child = child;
    this._query = query.where(ownerKey, child.getAttribute(foreignKey));
  }

  public get(): any {
    return this._query.first();
  }
}
