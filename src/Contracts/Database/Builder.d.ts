import Builder from '../../Database/Query/Builder';

export type JoinType = {
  first: string;
  operator: string;
  second: string;
  boolean: string;
};

export interface IJoinClause {
  public table: string;
  public joins: JoinType;
  public on: (first: string, operator: string, second: string, boolean: string) => Builder;
  public getString: () => string;
}

export type OrderByType = [string, string][];
