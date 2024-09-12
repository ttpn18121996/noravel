import Builder from '../../Database/Query/Builder';

export type JoinType = {
  first: string;
  operator: string;
  second: string;
  boolean: string;
};

export interface IJoinClause {
  table: string;
  joins: JoinType;
  on: (first: string, operator: string, second: string, boolean: string) => Builder;
  getString: () => string;
}

export type OrderByType = [string, string][];
