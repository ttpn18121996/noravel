import { _arr } from 'tiny-supporter';

export default class Processor {
  constructor() {
    this.params = [];
  }

  compileWhere(wheres) {
    let sql = ' WHERE ';
    for (let key = 0; key < wheres.length; ++key) {
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
        if (['IN', 'NOT IN'].includes(conditions[1])) {
          sql += `${conditions[0]} ${conditions[1]} (${_arr().range(0, conditions[2].length - 1).map(_ => '?').get().join(',')})`;
        } else if (['BETWEEN', 'NOT BETWEEN'].includes(conditions[1])) {
          sql += `${conditions[0]} ${conditions[1]} ? AND ?`;
        } else {
          sql += `${conditions[0]} ${conditions[1]} ${conditions[2] === null ? '' : '?'}`;
        }

        if (Array.isArray(conditions[2]) && ['BETWEEN', 'NOT BETWEEN'].includes(conditions[1])) {
          const [from, to] = conditions[2];
          this.params.push(from);
          this.params.push(to);
        } else {
          this.params.push(conditions[2]);
        }
      }
    }

    return sql;
  }

  compileJoin(joins) {
    let sql = '';

    for (const join of joins) {
      sql += join.getStringJoinClause();
    }

    return sql;
  }

  compileGroup(groups) {
    return ' GROUP BY ' + groups.join(', ');
  }
  
  compileHaving(havings) {
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
          sql += `${conditions[0]} ${conditions[1]} (${_arr().range(0, conditions[2].length - 1).map(_ => '?').get().join(',')})`;
        } else {
          sql += `${conditions[0]} ${conditions[1]} ${conditions[2] === null ? '' : '?'}`;
        }

        this.params.push(conditions[2]);
      }
    }

    return sql;
  }

  compileOrderBy(orders) {
    return ' ORDER BY ' + orders.map(([column, direction]) => `${column} ${direction}`).join(', ');
  }

  getBindings() {
    return this.params;
  }
}
