import { JsonSchema4 } from '../../types/dnd-types';
interface ParsedCondition {
    operator: string;
    value: any;
}
export declare const parseConditionSchema: (schema: JsonSchema4) => ParsedCondition | null;
export {};
