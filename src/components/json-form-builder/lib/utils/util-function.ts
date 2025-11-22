import { type Item, LayoutType } from "../types/dnd-types";
import { v4 as uuidv4 } from "uuid";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import type { RuleGroupType, RuleType } from "react-querybuilder";
import { PaletteIconMap } from "../constants/fields";
import { Columns, Group, Rows } from "lucide-react";
import { getCategoryColorByDsType } from "./fields-utils";
import { CommonTypes } from "@ds-sdk/sypher";
import type { CustomJsonSchema, CustomLayoutType } from "../context/dnd-context";

// Function to convert schemas
export function convertSchemas(jsonSchema: CustomJsonSchema, uiSchema: CustomLayoutType): Item[] {
  console.log("Parsing schema", jsonSchema)
  const outputArray: Item[] = [];
  var isFirstContainer = true;
  function processUiElements(
    uiElements: any,
    path = "",
    parentId = "mainContainer"
  ) {
    for (const element of uiElements) {
      if (element.type === "Control") {
        const keyName = element.scope.split("/").pop();
        // const propertyPath = path ? `${path}/${keyName}` : keyName;
        const id = uuidv4();
        const dsType = jsonSchema?.properties?.[keyName]?.dsType
        ? (jsonSchema?.properties[keyName]?.dsType as string)
        : "input"
        const item: Item = {
          keyName,
          title: jsonSchema?.properties?.[keyName]?.title ? jsonSchema?.properties?.[keyName]?.title : keyName,
          labelPlaceholder: jsonSchema?.properties?.[keyName]?.labelPlaceholder ? jsonSchema?.properties?.[keyName]?.labelPlaceholder : keyName,
          type: jsonSchema?.properties?.[keyName]?.type
            ? (jsonSchema?.properties[keyName]?.type as string)
            : "",
          id,
          dsType: dsType, 
          Icon: dsType ? (PaletteIconMap[dsType] ? PaletteIconMap[dsType] : PaletteIconMap.input) : PaletteIconMap.input,
          color: getCategoryColorByDsType(jsonSchema?.properties[keyName]?.dsType),
          parentId,
          isLayoutElement: false,
          description: undefined,
        };

        const property = jsonSchema?.properties?.[keyName];
        if (property?.description) item.description = property.description;
        if (property?.placeholder) item.placeholder = property.placeholder;
        if (property?.enum)
          item.options = property.enum;
        if (property?.format) item.format = property.format;
        if (property?.minLength) item.minLength = property.minLength;
        if (property?.maxLength) item.maxLength = property.maxLength;
        if (property?.minimum) item.minimum = property.minimum;
        if (property?.maximum) item.maximum = property.maximum;
        if (property?.pattern) {
          item.pattern = property.pattern;
          if(property.pattern) item.patternMessage = property?.patternProperties?.message?.title;
        }
        if (property?.maximum) item.maximum = property.maximum;
        if (property?.default) item.placeholder = property.default;
        if (property?.required) item.required = true;
        isFirstContainer = false;
        outputArray.push(item);
      } else if (
        element.type === "HorizontalLayout" ||
        element.type === "VerticalLayout"
      ) {
        const layoutId = uuidv4();
        const dsType = element.type === "HorizontalLayout" ? "horizontal-layout" : "vertical-layout"
        const layoutItem: Item = {
          keyName: "",
          title: element.type,
          type: element.type,
          direction: element.type === "HorizontalLayout" ? LayoutType.HORIZONTAL : LayoutType.VERTICAL,
          id: layoutId,
          Icon: element.type === "HorizontalLayout" ? Columns : Rows, // You can set an appropriate layout icon
          color: getCategoryColorByDsType(dsType),
          dsType: dsType,
          parentId,
          isLayoutElement: true,
        };
        if(isFirstContainer) {
          isFirstContainer = false;
  
          if (element.elements) {
            processUiElements(element.elements, path, parentId);
          }
        }
        else {
          outputArray.push(layoutItem);
  
          if (element.elements) {
            processUiElements(element.elements, path, layoutId);
          }
        }
      } else if (element.type === "Group") {
        const layoutId = uuidv4();
        const layoutItem: Item = {
          keyName: "",
          title: element.type,
          type: element.type,
          direction: LayoutType.VERTICAL,
          id: layoutId,
          Icon: Group, // You can set an appropriate layout icon
          color: getCategoryColorByDsType(element?.dsType),
          dsType: "group",
          parentId,
          isLayoutElement: true,
        };

        outputArray.push(layoutItem);

        if (element.elements) {
          processUiElements(element.elements, path, layoutId);
        }
      }
    }
  }

  processUiElements(uiSchema.elements);

  return outputArray;
}
interface SplitSchemaResult {
  name: string;
  jsonSchema: JsonSchema;
  uiSchema: UISchemaElement;
}

export function splitJsonFormsSchemas(
  jsonSchema: JsonSchema,
  uiSchema: UISchemaElement
): SplitSchemaResult[] {
  if (!jsonSchema.properties) {
    throw new Error("JSON Schema must have properties");
  }

  const results: SplitSchemaResult[] = [];
  const processedProperties = new Set<string>();

  // Create base JSON Schema template
  const baseJsonSchema: JsonSchema = {
    $schema: jsonSchema.$schema || "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: [],
    properties: {}
  };

  // Copy top-level fields
  for (const key in jsonSchema) {
    if (['title', 'description', '$id', 'definitions'].includes(key)) {
      baseJsonSchema[key] = jsonSchema[key];
    }
  }

  // Iterate over properties in their original order
  for (const propName of Object.keys(jsonSchema.properties)) {
    if (processedProperties.has(propName)) {
      continue; // Already processed as part of a group
    }

    // Check if property is part of a group
    const groupElement = findGroupElementContainingProperty(propName, uiSchema);
    if (groupElement) {
      const groupResult = processGroupLayout(
        groupElement,
        jsonSchema,
        baseJsonSchema,
        processedProperties
      );

      if (groupResult) {
        const groupName = `group_${groupElement.label?.toString().toLowerCase().replace(/\s+/g, '_') || 'unnamed'}`;
        results.push({
          name: groupName,
          jsonSchema: groupResult.jsonSchema,
          uiSchema: groupResult.uiSchema
        });
      }
    } else {
      // Process property individually
      const propSchema = jsonSchema.properties[propName];

      // Create new JSON Schema for this property
      const newJsonSchema: JsonSchema = {
        ...baseJsonSchema,
        title: `Schema for ${propName}`,
        properties: {
          [propName]: propSchema
        }
      };

      // Handle required fields
      if (jsonSchema.required?.includes(propName)) {
        newJsonSchema.required = [propName];
      }

      // Create new UI Schema for this property
      const newUiSchema = extractUiSchemaForProperty(uiSchema, propName);

      results.push({
        name: propName,
        jsonSchema: newJsonSchema,
        uiSchema: newUiSchema
      });
    }
  }

  return results;
}

function findGroupElementContainingProperty(propertyName: string, uiSchema: UISchemaElement): UISchemaElement | null {
  if ('elements' in uiSchema) {
    for (const element of uiSchema.elements) {
      if ((element.type === 'Group' || element.type === 'VerticalLayout' || element.type === 'HorizontalLayout') && 'elements' in element) {
        const propertyScopes = extractPropertyScopesFromLayout(element);
        const propNames = propertyScopes.map(scope => scope.split('/').pop()!);
        if (propNames.includes(propertyName)) {
          return element;
        }
      }
    }
  }
  return null;
}

function processGroupLayout(
  groupElement: UISchemaElement,
  originalJsonSchema: JsonSchema,
  baseJsonSchema: JsonSchema,
  processedProperties: Set<string>
): Omit<SplitSchemaResult, 'name'> | null {
  if (!('elements' in groupElement)) return null;

  const groupProperties: Record<string, any> = {};
  const groupRequired: string[] = [];

  // Extract all properties referenced in the group
  const propertyScopes = extractPropertyScopesFromLayout(groupElement);
  const propNames = propertyScopes.map(scope => scope.split('/').pop()!);

  // Process properties in their original order
  for (const prop of propNames) {
    if (originalJsonSchema.properties?.[prop]) {
      groupProperties[prop] = originalJsonSchema.properties[prop];
      processedProperties.add(prop);

      if (originalJsonSchema.required?.includes(prop)) {
        groupRequired.push(prop);
      }
    }
  }

  if (Object.keys(groupProperties).length === 0) return null;

  // Create JSON Schema for the group
  const groupJsonSchema: JsonSchema = {
    ...baseJsonSchema,
    title: groupElement.label || 'Grouped Fields',
    properties: groupProperties,
    required: groupRequired.length > 0 ? groupRequired : undefined
  };

  // Create UI Schema for the group - preserve the original layout type
  const groupUiSchema: UISchemaElement = {
    type: groupElement.type, // Preserve Group, VerticalLayout, or HorizontalLayout
    elements: groupElement.elements
  };

  // Copy additional properties from the original group element
  if ('label' in groupElement && groupElement.label) {
    groupUiSchema.label = groupElement.label;
  }

  return {
    jsonSchema: groupJsonSchema,
    uiSchema: groupUiSchema
  };
}

function extractPropertyScopesFromLayout(
  layout: UISchemaElement
): string[] {
  const scopes: string[] = [];

  if ('scope' in layout) {
    scopes.push(layout.scope as string);
  }

  if ('elements' in layout) {
    layout.elements?.forEach(element => {
      scopes.push(...extractPropertyScopesFromLayout(element));
    });
  }

  return scopes;
}

function extractUiSchemaForProperty(
  uiSchema: UISchemaElement,
  propertyName: string
): UISchemaElement {
  if ('elements' in uiSchema) {
    // Find the parent layout containing this property
    const parentLayout = findParentLayoutForProperty(uiSchema, propertyName);
    
    // Find the element for this property
    const relevantElement = findElementForProperty(uiSchema, propertyName);

    if (relevantElement) {
      if (parentLayout && (parentLayout.type === 'HorizontalLayout' || parentLayout.type === 'VerticalLayout')) {
        // Preserve the original layout type
        return {
          type: parentLayout.type,
          elements: [relevantElement]
        };
      } else {
        // Default to VerticalLayout if no specific parent layout found
        return {
          type: 'VerticalLayout',
          elements: [relevantElement]
        };
      }
    }
  }

  // Fallback to default control
  return {
    type: 'VerticalLayout',
    elements: [{
      type: 'Control',
      scope: `#/properties/${propertyName}`
    }]
  };
}

// Helper to find the element corresponding to a property
function findElementForProperty(
  uiSchema: UISchemaElement,
  propertyName: string
): UISchemaElement | undefined {
  if ('elements' in uiSchema) {
    for (const element of uiSchema.elements || []) {
      if ('scope' in element) {
        const scope = element.scope as string;
        if (scope.endsWith(`/${propertyName}`) || scope === `#/properties/${propertyName}`) {
          return element;
        }
      }
      
      // Recursively search in nested elements
      if ('elements' in element) {
        const foundElement = findElementForProperty(element, propertyName);
        if (foundElement) return foundElement;
      }
    }
  }
  return undefined;
}

// Helper to find the parent layout containing a property
function findParentLayoutForProperty(
  uiSchema: UISchemaElement,
  propertyName: string,
  parent?: UISchemaElement
): UISchemaElement | undefined {
  if ('elements' in uiSchema) {
    for (const element of uiSchema.elements || []) {
      if ('scope' in element) {
        const scope = element.scope as string;
        if (scope.endsWith(`/${propertyName}`) || scope === `#/properties/${propertyName}`) {
          return parent;
        }
      }
      
      // Recursively search in nested elements
      if ('elements' in element) {
        const foundParent = findParentLayoutForProperty(element, propertyName, element);
        if (foundParent) return foundParent;
      }
    }
  }
  return undefined;
}

/**
 * Build a partial JSON Schema snippet for a single leaf rule like:
 *   { field: "age", operator: ">", value: 18 }
 *
 * We return an object that uses "properties", "required", and the
 * operator-based constraint (e.g., "exclusiveMinimum": 18).
 */
function buildLeafSchema(field: string, operator: string, value: any): any {
  switch (operator) {
    case "=":
      return {
        properties: {
          [field]: { const: value },
        },
        required: [field],
      };
    case "!=":
      return {
        properties: {
          [field]: { not: { const: value } },
        },
        required: [field],
      };
    case ">":
      return {
        properties: {
          [field]: { exclusiveMinimum: value },
        },
        required: [field],
      };
    case ">=":
      return {
        properties: {
          [field]: { minimum: value },
        },
        required: [field],
      };
    case "<":
      return {
        properties: {
          [field]: { exclusiveMaximum: value },
        },
        required: [field],
      };
    case "<=":
      return {
        properties: {
          [field]: { maximum: value },
        },
        required: [field],
      };
    case "in":
      // "in" means the field must be one of these values
      return {
        properties: {
          [field]: { enum: Array.isArray(value) ? value : [value] },
        },
        required: [field],
      };
    case "notIn":
      // "notIn" means the field must NOT be any of these values
      return {
        properties: {
          [field]: { not: { enum: Array.isArray(value) ? value : [value] } },
        },
        required: [field],
      };
    default:
      // fallback to equality if unknown operator
      return {
        properties: {
          [field]: { const: value },
        },
        required: [field],
      };
  }
}

/**
 * Recursively converts a group or a single rule into a JSON Schema snippet
 * using "allOf" (for AND) or "anyOf" (for OR).
 */
function buildJsonSchemaCondition(groupOrRule: RuleGroupType | RuleType): any {
  if ("combinator" in groupOrRule && Array.isArray(groupOrRule.rules)) {
    // It's a nested group
    const subSchemas = groupOrRule.rules.map((r) => buildJsonSchemaCondition(r));
    if (groupOrRule.combinator.toLowerCase() === "and") {
      // "AND" -> "allOf"
      return {
        allOf: subSchemas,
      };
    } else {
      // "OR" -> "anyOf"
      return {
        anyOf: subSchemas,
      };
    }
  } else {
    // It's a single leaf rule
    const rule = groupOrRule as RuleType;
    return buildLeafSchema(rule.field, rule.operator, rule.value);
  }
}

/**
 * Main entry point that returns a JSONForms UI schema object with a single rule.
 *
 * You can attach this rule to whichever UI schema element you want to
 * SHOW/HIDE/ENABLE/DISABLE. In this example, we attach it to a top-level
 * "Control" with "scope": "#" and a "SHOW" effect.
 */
export function convertQueryToUiSchema(query: RuleGroupType) {
  // Build the JSON schema condition from the query
  const schemaCondition = buildJsonSchemaCondition(query);

  return {
    effect: "HIDE", // Could also be HIDE, ENABLE, or DISABLE
    condition: {
      // Use the entire form data as the scope
      scope: "#",
      // The partial JSON schema for the condition
      schema: schemaCondition,
      // If you want the condition to fail if the entire scope is undefined:
      // failWhenUndefined: true
    }
  };
}



/**
 * Recursively convert a react-querybuilder query into an equivalent JSON Schema snippet.
 * 
 * @param {Object} query - The react-querybuilder query node.
 *   Example shape (leaf node):
 *   {
 *     field: "myField",
 *     operator: "=",
 *     value: "foo"
 *   }
 *
 *   Or (internal node):
 *   {
 *     combinator: "and" | "or",
 *     rules: [ ...sub-queries... ]
 *   }
 * @returns {Object} A partial JSON Schema object that can be used inside
 *                   the `condition.schema` of a JSONForms rule.
 */
function queryToSchema(query) {
  // If this node has a `rules` array, it's an internal node
  // with a combinator ("and" / "or").
  if (query.rules && Array.isArray(query.rules)) {
    const subSchemas = query.rules.map((rule) => queryToSchema(rule));

    if (query.combinator === 'and') {
      // Use allOf for AND conditions
      return { allOf: subSchemas };
    } else if (query.combinator === 'or') {
      // Use anyOf for OR conditions
      return { anyOf: subSchemas };
    } else {
      throw new Error(`Unsupported combinator: ${query.combinator}`);
    }
  } else {
    // Otherwise, it's a leaf node. We map the operator to the appropriate JSON Schema constraint.
    const { field, operator, value } = query;

    switch (operator) {
      case '=':
        return {
          properties: {
            [field]: { const: value }
          }
        };
      case '!=':
        return {
          properties: {
            [field]: { not: { const: value } }
          }
        };
      case '<':
        return {
          properties: {
            [field]: { exclusiveMaximum: value }
          }
        };
      case '<=':
        return {
          properties: {
            [field]: { maximum: value }
          }
        };
      case '>':
        return {
          properties: {
            [field]: { exclusiveMinimum: value }
          }
        };
      case '>=':
        return {
          properties: {
            [field]: { minimum: value }
          }
        };
      case 'in':
        // Expect `value` to be an array in query-builder
        return {
          properties: {
            [field]: { enum: value }
          }
        };
      case 'notIn':
        // Expect `value` to be an array
        return {
          properties: {
            [field]: { not: { enum: value } }
          }
        };
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}

/**
 * Convert a react-querybuilder JSON query to a single JSONForms rule.
 * 
 * @param {Object} query - The react-querybuilder query structure.
 * @param {"HIDE" | "SHOW" | "ENABLE" | "DISABLE"} [effect="SHOW"] - The effect to apply 
 *     when the condition matches. Defaults to "SHOW".
 * @returns {Object} A JSONForms rule object, e.g.:
 *   {
 *     rule: {
 *       effect: 'SHOW',
 *       condition: {
 *         scope: '#',
 *         schema: { ... }
 *       }
 *     }
 *   }
 */
export function convertQueryBuilderToJsonFormsRule(query, effect = 'SHOW') {
  // Build the JSON Schema that represents the entire query
  const schema = queryToSchema(query);

  // Return a JSONForms rule object
  return {
    rule: {
      effect,
      // In many cases you’ll want the condition to look at the entire form data (#).
      // If each rule only references one property, you might set the scope to
      // something like `#/properties/<field>`. This example uses # for the entire form.
      condition: {
        scope: '#',
        // The schema we built from the query
        schema
        // Optionally you can add "failWhenUndefined: true" if needed:
        // failWhenUndefined: true
      }
    }
  };
}

/**
 * Converts a given string to snake_case.
 * @param input - The string to be converted to snake_case.
 * @returns The snake_case version of the input string.
 */
export function toSnakeCase(input: string): string {
  // Replace all non-alphanumeric characters (excluding spaces) with spaces
  let snake = input.replace(/[^a-zA-Z0-9\s]+/g, ' ');

  // Handle camelCase by inserting spaces before uppercase letters
  snake = snake.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

  // Trim leading and trailing spaces, then split by spaces
  const words = snake.trim().split(/\s+/);

  // Join words with underscores and convert to lowercase
  snake = words.join('_').toLowerCase();

  return snake;
}

/**
* Attempts to reconstruct the original string from a snake_case string.
* Note: Original casing and special characters cannot be recovered.
* @param snake - The snake_case string to be converted back.
* @returns An approximate reconstruction of the original string.
*/
export function fromSnakeCase(snake: string): string {
  // Split the snake_case string by underscores
  const words = snake.split('_');

  // Capitalize the first letter of each word
  const capitalizedWords = words.map(word => {
    if (word.length === 0) return word;
    return word[0].toUpperCase() + word.slice(1);
  });

  // Join words with spaces
  const original = capitalizedWords.join(' ');

  return original;
}



export const jsonToByteArray = (json: JSON) => {
  return new TextEncoder().encode(JSON.stringify(json));
}

export const byteArrayToJSON = (array: Uint8Array) => {
  return JSON.parse(new TextDecoder().decode(array));
}

export function buildMinimalAddressString(accessHistory: CommonTypes.AccessHistory): string {
  const { district, city, regionName, country } = accessHistory;

  const parts = [
    district,    // Street (optional, assumed as district here)
    city,        // City name
    regionName,  // State/Region name
    country,     // Country name
  ];

  // Filter out undefined or empty parts and join them with a comma
  return parts.filter(part => part && part.trim()).join(", ");
}