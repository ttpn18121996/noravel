import { empty } from 'tiny-supporter';
import { IJoinClause, JoinType } from '../../Contracts/Database/Builder';
import Builder from './Builder';

export default class JoinClause implements IJoinClause {
  public joins: JoinType = { first: '', operator: '=', second: '', boolean: 'AND' };

  constructor(
    public builder: Builder,
    public table: string,
    public type: string = 'INNER',
  ) {}

  public on(first: string, operator: string, second: string, boolean: string): Builder {
    this.joins = { first, operator, second, boolean };

    return this.builder;
  }

  public getString(): string {
    let on = ` ${this.type} JOIN ${this.table} ON ${this.joins.first} ${this.joins.operator} ${this.joins.second}`;

    if(!empty(this.builder._wheres)) {
      on += ` ${this.joins.boolean} ${this.builder._processor.compileWhere(this.builder._wheres).replace(/ WHERE /i, '')}`;
    }

    return on;
  };
}
