interface IRule {
  id: string;
  eventType: string;
  conditions: ICondition[];
  games?: string[];
  status?: string;
  name?: string;
}

interface ICondition{
  scope: string;   // scope can be payload, stats, etc
  field: string;   // field can be amount, code, etc
  value: any;   // value can be 1000, BONUS100, etc
  op: string;  // condition can be gte, eq, etc
  status?: string;
}

export { IRule, ICondition };
