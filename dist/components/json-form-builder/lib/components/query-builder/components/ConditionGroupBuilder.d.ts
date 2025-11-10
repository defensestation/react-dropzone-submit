interface ConditionSchema {
    [key: string]: any;
}
/**
 * -------------------------------
 * 1) A "group" component that can hold multiple conditions
 *    and combine them with AND/OR.
 * -------------------------------
 */
export default function ConditionGroupBuilder({ value, onChange, }: {
    /** The final combined schema (if you want to prefill or edit) */
    value?: ConditionSchema;
    /** Callback when the final schema changes */
    onChange: (schema: ConditionSchema) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
