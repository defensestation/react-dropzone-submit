import { Item } from '../types/dnd-types';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { RuleGroupType } from 'react-querybuilder';
import { CommonTypes } from '@ds-sdk/sypher';
import { CustomJsonSchema, CustomLayoutType } from '../context/dnd-context';
export declare function convertSchemas(jsonSchema: CustomJsonSchema, uiSchema: CustomLayoutType): Item[];
interface SplitSchemaResult {
    name: string;
    jsonSchema: JsonSchema;
    uiSchema: UISchemaElement;
}
export declare function splitJsonFormsSchemas(jsonSchema: JsonSchema, uiSchema: UISchemaElement): SplitSchemaResult[];
/**
 * Main entry point that returns a JSONForms UI schema object with a single rule.
 *
 * You can attach this rule to whichever UI schema element you want to
 * SHOW/HIDE/ENABLE/DISABLE. In this example, we attach it to a top-level
 * "Control" with "scope": "#" and a "SHOW" effect.
 */
export declare function convertQueryToUiSchema(query: RuleGroupType): {
    effect: string;
    condition: {
        scope: string;
        schema: any;
    };
};
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
export declare function convertQueryBuilderToJsonFormsRule(query: any, effect?: string): {
    rule: {
        effect: string;
        condition: {
            scope: string;
            schema: {
                allOf: any;
                anyOf?: undefined;
                properties?: undefined;
            } | {
                anyOf: any;
                allOf?: undefined;
                properties?: undefined;
            } | {
                properties: {
                    [x: number]: {
                        const: any;
                    };
                };
                allOf?: undefined;
                anyOf?: undefined;
            } | {
                properties: {
                    [x: number]: {
                        not: {
                            const: any;
                        };
                    };
                };
                allOf?: undefined;
                anyOf?: undefined;
            } | {
                properties: {
                    [x: number]: {
                        exclusiveMaximum: any;
                    };
                };
                allOf?: undefined;
                anyOf?: undefined;
            } | {
                properties: {
                    [x: number]: {
                        maximum: any;
                    };
                };
                allOf?: undefined;
                anyOf?: undefined;
            } | {
                properties: {
                    [x: number]: {
                        exclusiveMinimum: any;
                    };
                };
                allOf?: undefined;
                anyOf?: undefined;
            } | {
                properties: {
                    [x: number]: {
                        minimum: any;
                    };
                };
                allOf?: undefined;
                anyOf?: undefined;
            } | {
                properties: {
                    [x: number]: {
                        enum: any;
                    };
                };
                allOf?: undefined;
                anyOf?: undefined;
            } | {
                properties: {
                    [x: number]: {
                        not: {
                            enum: any;
                        };
                    };
                };
                allOf?: undefined;
                anyOf?: undefined;
            };
        };
    };
};
/**
 * Converts a given string to snake_case.
 * @param input - The string to be converted to snake_case.
 * @returns The snake_case version of the input string.
 */
export declare function toSnakeCase(input: string): string;
/**
* Attempts to reconstruct the original string from a snake_case string.
* Note: Original casing and special characters cannot be recovered.
* @param snake - The snake_case string to be converted back.
* @returns An approximate reconstruction of the original string.
*/
export declare function fromSnakeCase(snake: string): string;
export declare const jsonToByteArray: (json: JSON) => Uint8Array<ArrayBufferLike>;
export declare const byteArrayToJSON: (array: Uint8Array) => any;
export declare function buildMinimalAddressString(accessHistory: CommonTypes.AccessHistory): string;
export {};
