export type Condition = {
    type: "condition";
    schema: any;
} | {
    type: "group";
    logic: "AND" | "OR";
    conditions: Condition[];
};
export interface Rule {
    effect: "HIDE" | "SHOW" | "ENABLE" | "DISABLE";
    condition: {
        scope: string;
        schema: any;
        failWhenUndefined?: boolean;
    };
}
export type Operator = 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
export type Effect = 'SHOW' | 'HIDE' | 'ENABLE' | 'DISABLE';
export type ConditionType = "isEqual" | "isNotEqual" | "beginsWith" | "endsWith" | "contains" | "doesNotContain" | "enum" | "range" | "all";
