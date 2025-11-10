// utils/evaluateRule.ts
import Ajv, { ValidateFunction } from 'ajv';
import { CustomRule } from '../types/dnd-types';

const ajv = new Ajv();
const validateCache: Record<string, ValidateFunction> = {};

export const evaluateRule = (rule: CustomRule, data: any): boolean => {
    console.log({rule, data})
  if (!rule.condition || !rule.condition.schema) return false;

  // Resolve the scope path to get the relevant data subset
  const scopedData = data;
console.log({scopedData})
  if (scopedData === undefined) return false;

  const schemaKey = JSON.stringify(rule.condition.schema);
  let validate: ValidateFunction;

  if (validateCache[schemaKey]) {
    validate = validateCache[schemaKey];
  } else {
    validate = ajv.compile(rule.condition.schema);
    validateCache[schemaKey] = validate;
  }

  const valid = validate(scopedData);
  return valid;
};
