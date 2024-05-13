import { empty } from "tiny-supporter";

export default class JoinClause {
  constructor(builder, table, type = 'INNER') {
    this.builder = builder;
    this.table = table;
    this.type = type;
    this.joins = {};
  }

  on(first, operator, second, boolean = 'AND') {
    this.joins = { first, operator, second, boolean };

    return this.builder;
  }

  getStringJoinClause() {
    let on = ` ${this.type} JOIN ${this.table} ON ${this.joins.first} ${this.joins.operator} ${this.joins.second}`;

    if (!empty(this.builder.wheres)) {
      on += ` ${this.joins.boolean} ${this.builder.processor.compileWhere(this.builder.wheres).replace(/ WHERE /i, '')}`;
    }

    return on;
  }
}
