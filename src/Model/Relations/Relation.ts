import Builder from '../../Database/Query/Builder';
import Model from '../Model';

export default abstract class Relation<T extends Model> {
  protected _model?: T;

  public abstract get(): any;

  public constructor(protected _query: Builder) {}

  public setModel(model: T) {
    this._model = model;
    this._query.setModel(model);
  }
}
