import { _arr } from 'tiny-supporter';
import { IJoinClause, OrderByType } from '../../../Contracts/Database/Builder';

export default abstract class Processor {
  public params: any[] = [];

  public abstract compileLimit(limit?: number | null, offset?: number | null): string;

  public compileWhere(wheres: any[]): string {
    let sql = ' WHERE ';

    for (let key = 0; key < wheres.length; key++) {
      const conditions = wheres[key];

      if (key) {
        if (Array.isArray(conditions[0])) {
          sql += ` ${conditions[0][3]} `;
        } else {
          sql += ` ${conditions[3]} `;
        }
      }

      if (Array.isArray(conditions[0])) {
        for (let subKey = 0; subKey < conditions.length; subKey++) {
          const subConditions = conditions[key];

          if (!subKey) {
            sql += '(';
          } else {
            sql += ` ${subConditions[3]} `;
          }

          sql += `${subConditions[0]} ${subConditions[1] === null ? 'IS NULL' : subConditions[1]} ?`;
          this.params.push(subConditions[2]);
        }

        sql += ')';
      } else {
        if (['IN', 'NOT IN'].includes(conditions[1])) {
          this.params = this.params.concat(conditions[2]);
          sql += `${conditions[0]} ${conditions[1]} (${_arr()
            .range(0, conditions[2].length)
            .map(_ => '?')
            .join(',')})`;
        } else if (['BETWEEN', 'NOT BETWEEN'].includes(conditions[1])) {
          const [from, to] = conditions[2];
          this.params.push(from);
          this.params.push(to);

          sql += `${conditions[0]} ${conditions[1]} ? AND ?`;
        } else {
          this.params.push(conditions[2]);
          sql += `${conditions[0]} ${conditions[1]} ${conditions[2] === null ? '' : '?'}`;
        }
      }
    }

    return sql;
  }

  public compileJoin(joins: IJoinClause[]): string {
    let sql = '';

    for (const join of joins) {
      sql += join.getString();
    }

    return sql;
  }

  public compileGroup(groups: string[]): string {
    return ' GROUP BY ' + groups.join(', ');
  }

  public compileHaving(havings: any[]): string {
    let sql = 'HAVING ';

    for (let key = 0; key < havings.length; ++key) {
      const conditions = havings[key];

      if (key) {
        if (Array.isArray(conditions[0])) {
          sql += ` ${conditions[0][3]} `;
        } else {
          sql += ` ${conditions[3]} `;
        }
      }

      if (Array.isArray(conditions[0])) {
        for (let subKey = 0; subKey < conditions.length; subKey++) {
          const subConditions = conditions[subKey];
          if (!subKey) {
            sql += '(';
          } else {
            sql += ` ${subConditions[3]} `;
          }

          sql += `${subConditions[0]} ${subConditions[1] === null ? 'IS NULL' : subConditions[1]} ?`;
          this.params.push(subConditions[2]);
        }

        sql += ')';
      } else {
        if (conditions[1] === 'IN' || conditions[1] === 'NOT IN') {
          sql += `${conditions[0]} ${conditions[1]} (${_arr()
            .range(0, conditions[2].length)
            .map(_ => '?')
            .join(',')})`;
        } else {
          sql += `${conditions[0]} ${conditions[1]} ${conditions[2] === null ? '' : '?'}`;
        }

        this.params.push(conditions[2]);
      }
    }

    return sql;
  }

  public compileOrderBy(orders: OrderByType): string {
    return ' ORDER BY ' + orders.map(([column, direction]) => `${column} ${direction}`).join(', ');
  }

  public compileInsert(table: string, data: any[]): string {
    let sql = `INSERT INTO ${table} `;
    let values: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      let fields = Object.keys(value);

      if (!i) {
        sql += `(${fields.join(', ')}) VALUES (`;
      }

      sql += fields.map(_ => '?').join(', ') + '), (';

      values = values.concat(Object.values(value));
    }

    this.params = this.params.concat(values);

    sql = sql.replace(/\, \($/, '');

    return sql;
  }

  public getBindings() {
    return this.params;
  }
}
