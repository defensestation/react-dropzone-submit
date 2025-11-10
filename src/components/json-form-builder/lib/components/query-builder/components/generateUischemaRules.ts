// src/utils/generateUischemaRules.ts
import { Rule } from '../types';

export const generateUischemaRules = (rules: Rule[]) => {
  return rules.map((rule) => {
    if (rule.conditions.length === 1) {
      const condition = {
        scope: rule.conditions[0].scope,
        [convertOperator(rule.conditions[0].operator)]: parseValue(rule.conditions[0].value),
      };

      return {
        effect: rule.effect,
        condition,
      };
    } else {
      // For multiple conditions, combine them using 'and'
      const combinedCondition = {
        and: rule.conditions.map((cond) => ({
          scope: cond.scope,
          [convertOperator(cond.operator)]: parseValue(cond.value),
        })),
      };

      return {
        effect: rule.effect,
        condition: combinedCondition,
      };
    }
  });
};

const convertOperator = (operator: string): string => {
  switch (operator) {
    case 'equals':
      return 'equals';
    case 'notEquals':
      return 'notEquals';
    case 'greaterThan':
      return 'greaterThan';
    case 'lessThan':
      return 'lessThan';
    // Add more mappings as needed
    default:
      return operator;
  }
};

const parseValue = (value: any): any => {
  // Attempt to parse numeric and boolean values, fallback to string
  if (value === 'true') return true;
  if (value === 'false') return false;
  const num = Number(value);
  return isNaN(num) ? value : num;
};
