import { CustomRuleEffect, Item } from '../../../types/dnd-types';
type ConditionSchemaBuilderProps = {
    value?: any;
    onChange: (schema: any) => void;
    fields: string[];
    items: Item[];
    effect: CustomRuleEffect;
};
declare function ConditionSchemaBuilder({ value, onChange, fields, items, effect, }: ConditionSchemaBuilderProps): import("react/jsx-runtime").JSX.Element;
export default ConditionSchemaBuilder;
