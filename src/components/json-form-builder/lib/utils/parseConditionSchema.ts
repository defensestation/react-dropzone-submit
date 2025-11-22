// utils/parseConditionSchema.ts

import type { JsonSchema } from "@jsonforms/core";


interface ParsedCondition {
  operator: string;
  value: any;
}

export const parseConditionSchema = (schema: JsonSchema): ParsedCondition | null => {
  if (!schema) return null;

  // isEqual
  if (schema.const !== undefined) {
    return { operator: 'is equal to', value: schema.const };
  }

  // isNotEqual
  if (schema.not && schema.not.const !== undefined) {
    return { operator: 'is not equal to', value: schema.not.const };
  }

  // beginsWith, endsWith, contains
  if (schema.pattern) {
    const pattern = schema.pattern;
    if (pattern.startsWith('^') && pattern.endsWith('$')) {
      // Exact match
      const value = pattern.slice(1, -1);
      return { operator: 'is equal to', value };
    } else if (pattern.startsWith('^')) {
      const value = pattern.slice(1);
      return { operator: 'begins with', value };
    } else if (pattern.endsWith('$')) {
      const value = pattern.slice(0, -1);
      return { operator: 'ends with', value };
    } else {
      return { operator: 'contains', value: pattern };
    }
  }

  // doesNotContain
  if (schema.not && schema.not.pattern) {
    return { operator: 'does not contain', value: schema.not.pattern };
  }

  // enum
  if (schema.enum && Array.isArray(schema.enum)) {
    return { operator: 'is one of', value: schema.enum };
  }

  // range
  if (schema.minimum !== undefined || schema.maximum !== undefined) {
    const range: any = {};
    if (schema.minimum !== undefined) {
      range.min = schema.minimum;
      range.exclusiveMin = schema.exclusiveMinimum || false;
    }
    if (schema.maximum !== undefined) {
      range.max = schema.maximum;
      range.exclusiveMax = schema.exclusiveMaximum || false;
    }
    return { operator: 'is within range', value: range };
  }

  return null;
};
