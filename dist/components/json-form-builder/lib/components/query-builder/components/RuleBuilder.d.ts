interface ConditionSchema {
    [key: string]: any;
}
interface ConditionSchemaBuilderProps {
    initialValue?: ConditionSchema;
    onChange: (schema: ConditionSchema) => void;
}
/**
 * ConditionSchemaBuilder
 * Allows user to pick between:
 *  - const
 *  - enum
 *  - range
 *
 * Also includes a "Negate?" toggle to wrap the final schema in { "not": ... }.
 */
export declare function ConditionSchemaBuilder({ initialValue, onChange, }: ConditionSchemaBuilderProps): import("react/jsx-runtime").JSX.Element;
export {};
